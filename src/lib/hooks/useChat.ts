import { useState, useEffect } from 'react';
import { Chat, ChatMessage } from '../utils';
import { collection, query, where, onSnapshot, orderBy, Unsubscribe, doc, updateDoc } from 'firebase/firestore';
import db from '../../../firebase.config';



interface UseChatReturn {
  chat: Chat | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  userChats: Chat[];
  unreadCount: number;
  markMessagesAsRead: () => Promise<void>;  // Added this to the interface
}

export const useChat = (chatId: string, userAddress?: string): UseChatReturn => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Listen to specific chat updates
  useEffect(() => {
    if (!chatId) return;

    let unsubscribeChat: Unsubscribe;
    let unsubscribeMessages: Unsubscribe;

    try {
      // Listen to chat document changes
      unsubscribeChat = onSnapshot(
        doc(db, 'chats', chatId),
        (snapshot) => {
          if (snapshot.exists()) {
            const chatData = snapshot.data() as Chat;
            // Fixed the spread operation to avoid id overwrite
            setChat({
              ...chatData,
              id: snapshot.id
            });
            setLoading(false);
          } else {
            setChat(null);
            setError('Chat not found');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error listening to chat:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      // Listen to chat messages
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('timestamp', 'asc')
      );

      unsubscribeMessages = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
          })) as ChatMessage[];
          setMessages(newMessages);
        },
        (error) => {
          console.error('Error listening to messages:', error);
          setError(error.message);
        }
      );
    } catch (error) {
      console.error('Error setting up chat listeners:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoading(false);
    }

    return () => {
      if (unsubscribeChat) unsubscribeChat();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [chatId]);

  // Listen to user's chats list
  useEffect(() => {
    if (!userAddress) return;

    let unsubscribeUserChats: Unsubscribe;

    try {
      // Query chats where user is a participant
      const userChatsQuery = query(
        collection(db, 'chats'),
        where('participantAddresses', 'array-contains', userAddress.toLowerCase())
      );

      unsubscribeUserChats = onSnapshot(
        userChatsQuery,
        (snapshot) => {
          const chats = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
          })) as Chat[];
          
          setUserChats(chats);

          // Calculate total unread messages
          const totalUnread = chats.reduce((acc, chat) => {
            return acc + (chat.unreadCount?.[userAddress.toLowerCase()] || 0);
          }, 0);
          
          setUnreadCount(totalUnread);
        },
        (error) => {
          console.error('Error listening to user chats:', error);
          setError(error.message);
        }
      );
    } catch (error) {
      console.error('Error setting up user chats listener:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }

    return () => {
      if (unsubscribeUserChats) unsubscribeUserChats();
    };
  }, [userAddress]);

  // Helper function to mark messages as read
  const markMessagesAsRead = async (): Promise<void> => {
    if (!chat || !userAddress || !chatId) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userAddress.toLowerCase()}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  return {
    chat,
    messages,
    loading,
    error,
    userChats,
    unreadCount,
    markMessagesAsRead
  };
};

export default useChat;