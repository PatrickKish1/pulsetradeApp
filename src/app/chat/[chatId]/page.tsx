'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { IExecWeb3mail } from '@iexec/web3mail';
import { ArrowLeft } from 'lucide-react';
import MessageInput from '@/src/components/chats/MessageInput';
import MessageList from '@/src/components/chats/MessageList';
import TxNotification from '@/src/components/TxNotification';
import { Button } from '@/src/components/ui/button';
import useAuth from '@/src/lib/hooks/useAuth';
import { Chat, ChatMessage } from '@/src/lib/utils';
import db from '../../../../firebase.config';



interface MessageData {
  chatId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: number;
  isWeb3Mail?: boolean;
  protectedDataAddress?: string;
}

interface LastMessage {
  content: string;
  timestamp: number;
  senderId: string;
  recipientId: string;
}

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { address } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !chatId) return;

    // Fetch chat details
    const chatRef = doc(db, 'chats', chatId as string);
    const unsubscribeChat = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        setChat({ id: doc.id, ...doc.data() } as Chat);
      } else {
        setError('Chat not found');
      }
    });

    // Fetch messages
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as ChatMessage);
      
      setMessages(messageList);
      setLoading(false);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMessages();
    };
  }, [address, chatId]);

  const sendMessage = async (content: string) => {
    if (!address || !chat) return;

    setSending(true);
    setError(null);

    try {
      const recipient = chat.participants.find(p => p.address !== address);
      if (!recipient) throw new Error('No recipient found');

      // Create message data with proper typing
      const messageData: MessageData = {
        chatId: chatId as string,
        senderId: address,
        recipientId: recipient.address,
        content,
        timestamp: Date.now()
      };

      // Add web3mail fields if recipient has it enabled
      if (recipient.isWeb3MailEnabled && recipient.protectedDataAddress) {
        const web3mail = new IExecWeb3mail(window.ethereum);
        const { taskId } = await web3mail.sendEmail({
          emailSubject: 'New Message',
          emailContent: content,
          protectedData: recipient.protectedDataAddress,
          contentType: 'text/plain',
          senderName: 'Chat Message',
          workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
        });
        
        messageData.isWeb3Mail = true;
        messageData.protectedDataAddress = recipient.protectedDataAddress;
        setTxHash(taskId);
      }

      // Store message in Firebase
      await addDoc(collection(db, 'messages'), messageData);

      // Update chat's lastMessage and updatedAt with proper typing
      const lastMessage: LastMessage = {
        content,
        timestamp: Date.now(),
        senderId: address,
        recipientId: recipient.address
      };

      const chatRef = doc(db, 'chats', chatId as string);
      await updateDoc(chatRef, {
        lastMessage,
        updatedAt: Date.now(),
        [`unreadCount.${recipient.address.toLowerCase()}`]: (chat.unreadCount?.[recipient.address.toLowerCase()] || 0) + 1
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    router.push('/chats');
  };

  if (!address) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please connect your wallet to view messages</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button onClick={handleBack}>Back to Chats</Button>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">Chat not found</p>
        <Button onClick={handleBack}>Back to Chats</Button>
      </div>
    );
  }

  const recipient = chat.participants.find(p => p.address !== address);
  const recipientAddress = recipient?.address || 'Unknown';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center space-x-4 fixed w-full z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {chat.type === 'group' ? chat.name : (
              <span title={recipientAddress}>
                {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
              </span>
            )}
          </h1>
          {chat.type !== 'group' && recipient?.isWeb3MailEnabled && (
            <p className="text-sm text-gray-500">Web3Mail Enabled</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 mt-20 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserAddress={address}
        />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t">
        <MessageInput
          onSendMessage={sendMessage}
          isProcessing={sending}
        />
        {error && (
          <div className="px-4 py-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Transaction Notification */}
      {txHash && (
        <TxNotification
          hash={txHash}
          blockExplorerUrl="https://blockscout-bellecour.iex.ec"
        />
      )}
    </div>
  );
}