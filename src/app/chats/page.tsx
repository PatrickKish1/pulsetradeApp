'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import ChatList from '@/src/components/chats/ChatList';
import CreateChat from '@/src/components/chats/CreateChat';
import Header from '@/src/components/Header';
import { AlertDialogHeader } from '@/src/components/ui/alert-dialog';
import { Button } from '@/src/components/ui/button';
import useAuth from '@/src/lib/hooks/useAuth';
import { Chat } from '@/src/lib/utils';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@radix-ui/react-alert-dialog';
import db from '../../../firebase.config';
import Image from 'next/image';

const CHATS_PER_PAGE = 20;

export default function ChatsPage() {
  const router = useRouter();
  const { address, isConnected, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [showError, setShowError] = useState(false);
  const [lastChatRef, setLastChatRef] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadInitialChats = useCallback(async () => {
    if (!address || !db) {
      setLoading(false);
      return;
    }

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participantAddresses', 'array-contains', address.toLowerCase()),
        orderBy('updatedAt', 'desc'),
        limit(CHATS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Chat));

      setChats(chatList);
      setLastChatRef(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === CHATS_PER_PAGE);
      setLoading(false);
      updateTitleAndNotifications(chatList);
    } catch (err) {
      console.error("Error loading initial chats:", err);
      setError("Failed to load chats. Please try again.");
      setLoading(false);
      setShowError(true);
    }
  }, [address]);

  const loadMoreChats = async () => {
    if (!hasMore || !lastChatRef || !address || !db || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participantAddresses', 'array-contains', address.toLowerCase()),
        orderBy('updatedAt', 'desc'),
        startAfter(lastChatRef),
        limit(CHATS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const newChats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Chat));

        setChats(prev => [...prev, ...newChats]);
        setLastChatRef(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === CHATS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more chats:", err);
      setError("Failed to load more chats. Please try again.");
      setShowError(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const updateTitleAndNotifications = useCallback((chatList: Chat[]) => {
    if (!address) return;

    const totalUnread = chatList.reduce((sum, chat) => 
      sum + (chat.unreadCount[address.toLowerCase()] || 0), 0
    );

    if (totalUnread > 0) {
      document.title = `(${totalUnread}) Messages`;
      
      if ('Notification' in window && Notification.permission === 'granted') {
        const latestUnreadChat = chatList.find(chat => 
          (chat.unreadCount[address.toLowerCase()] || 0) > 0
        );
        if (latestUnreadChat?.lastMessage) {
          new Notification('New Message', {
            body: latestUnreadChat.lastMessage.content,
            icon: '/notification-icon.png'
          });
        }
      }
    } else {
      document.title = 'Messages';
    }
  }, [address]);

  // Listen only for recent chat updates
  useEffect(() => {
    if (!address || !db || authLoading) return;

    const chatsRef = collection(db, 'chats');
    const recentChatsQuery = query(
      chatsRef,
      where('participantAddresses', 'array-contains', address.toLowerCase()),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      recentChatsQuery,
      {
        next: (snapshot) => {
          if (!snapshot.empty) {
            const updatedChat = {
              id: snapshot.docs[0].id,
              ...snapshot.docs[0].data(),
            } as Chat;

            setChats(prev => {
              const existingIndex = prev.findIndex(c => c.id === updatedChat.id);
              if (existingIndex === -1) {
                return [updatedChat, ...prev];
              }
              const newChats = [...prev];
              newChats[existingIndex] = updatedChat;
              return newChats.sort((a, b) => b.updatedAt - a.updatedAt);
            });

            updateTitleAndNotifications(chats);
          }
        },
        error: (err) => {
          console.error("Error in chat listener:", err);
          setError("Failed to sync chat updates. Please refresh the page.");
          setShowError(true);
        }
      }
    );

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
      document.title = 'Messages';
    };
  }, [address, authLoading, chats, updateTitleAndNotifications]);

  useEffect(() => {
    if (!authLoading) {
      loadInitialChats();
    }
  }, [loadInitialChats, authLoading]);

  const handleChatSelect = useCallback((chat: Chat) => {
    router.push(`/chat/${chat.id}`);
  }, [router]);

  const handleChatCreated = useCallback((chatId: string) => {
    setShowCreateChat(false);
    setShowGroupChat(false);
    router.push(`/chat/${chatId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setShowError(false);
    loadInitialChats();
  }, [loadInitialChats]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex justify-center items-center h-64">
            <Image
              src="/logo.png"
              alt="Loading"
              width={48}
              height={48}
              className="animate-pulse"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">Please connect your wallet to view and manage your chats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Messages
            {loading && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
          </h1>
          <div className="flex space-x-4">
            <Button
              onClick={() => {
                setShowCreateChat(true);
                setShowGroupChat(false);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Start New Chat
            </Button>
            <Button
              onClick={() => {
                setShowCreateChat(true);
                setShowGroupChat(true);
              }}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Create Group
            </Button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading your conversations...</p>
            </div>
          ) : chats.length > 0 ? (
            <>
              <ChatList
                chats={chats}
                onChatSelect={handleChatSelect}
                currentUserAddress={address}
                recipientAddress={address}
              />
              {hasMore && (
                <Button
                  onClick={loadMoreChats}
                  variant="ghost"
                  className="w-full mt-4"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Chats'}
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500 text-lg mb-6">No conversations yet</p>
              <Button
                onClick={() => setShowCreateChat(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Start Your First Chat
              </Button>
            </div>
          )}
        </div>

        {showCreateChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <CreateChat
                onSuccess={handleChatCreated}
                onCancel={() => setShowCreateChat(false)}
                initialGroupChat={showGroupChat}
              />
            </div>
          </div>
        )}

        <AlertDialog open={showError} onOpenChange={setShowError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>
                {error}
                <div className="mt-4">
                  <Button onClick={handleRetry} className="mr-2">
                    Retry
                  </Button>
                  <Button variant="outline" onClick={() => setShowError(false)}>
                    Dismiss
                  </Button>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}