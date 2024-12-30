import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import useAuth from '@/src/lib/hooks/useAuth';
import CreateChatForm from './CreateChatForm';
import { CreateChatFormData } from '@/src/lib/hooks/chatsUtil';
import useChat from '@/src/lib/hooks/useChat';
import { User } from '@/src/lib/utils';
import { isAddress } from 'ethers';
import db from '../../../firebase.config';

interface CreateChatProps {
  onSuccess: (chatId: string) => void;
  onCancel?: () => void;
  initialGroupChat?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const CreateChat: React.FC<CreateChatProps> = ({
  onSuccess,
  onCancel,
  initialGroupChat = false
}) => {
  const { address, isConnected } = useAuth(); // Updated to use new auth hook
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);

  const { chat: existingChat } = useChat(existingChatId || '');

  const checkExistingIndividualChat = async (recipientAddr: string): Promise<string | null> => {
    try {
      if (!address) return null;

      const chatsRef = collection(db, 'chats');
      const participantAddresses = [address.toLowerCase(), recipientAddr.toLowerCase()].sort();

      const q = query(
        chatsRef,
        where('type', '==', 'individual'),
        where('participantAddresses', '==', participantAddresses)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : querySnapshot.docs[0].id;
    } catch (error) {
      console.error('Error checking existing chat:', error);
      return null;
    }
  };

  const validateFields = async (formData: CreateChatFormData): Promise<boolean> => {
    const newErrors: ValidationError[] = [];

    if (!address) {
      newErrors.push({
        field: 'general',
        message: 'Please connect your wallet first'
      });
      return false;
    }

    if (formData.isGroup) {
      if (!formData.groupName?.trim()) {
        newErrors.push({
          field: 'groupName',
          message: 'Group name is required'
        });
      }

      const validParticipants = formData.participants
        .map(p => p.trim())
        .filter(p => p && isAddress(p));

      if (validParticipants.length < 2) {
        newErrors.push({
          field: 'participants',
          message: 'At least 2 valid participant addresses are required'
        });
      }

      const uniqueAddresses = new Set(validParticipants.map(p => p.toLowerCase()));
      if (uniqueAddresses.size !== validParticipants.length) {
        newErrors.push({
          field: 'participants',
          message: 'Duplicate addresses are not allowed'
        });
      }

      if (validParticipants.some(p => p.toLowerCase() === address.toLowerCase())) {
        newErrors.push({
          field: 'participants',
          message: 'You cannot add yourself as a participant'
        });
      }
    } else {
      if (!formData.recipientAddress.trim()) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Recipient address is required'
        });
      } else if (!isAddress(formData.recipientAddress)) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Invalid Ethereum address format'
        });
      } else if (formData.recipientAddress.toLowerCase() === address.toLowerCase()) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Cannot create chat with yourself'
        });
      } else {
        const existingId = await checkExistingIndividualChat(formData.recipientAddress);
        if (existingId) {
          setExistingChatId(existingId);
          return false;
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleFormSubmit = async (formData: CreateChatFormData) => {
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      if (existingChatId) {
        onSuccess(existingChatId);
        return;
      }

      const isValid = await validateFields(formData);
      if (!isValid) {
        setLoading(false);
        return;
      }

      const currentUser: User = {
        address: address.toLowerCase(),
        isWeb3MailEnabled: false,
        createdAt: Date.now(),
        lastSeen: Date.now()
      };

      let chatId: string;

      if (formData.isGroup) {
        const validParticipants = formData.participants
          .map(p => p.trim())
          .filter(p => p && isAddress(p));

        const uniqueParticipants = Array.from(new Set(
          validParticipants.map(p => p.toLowerCase())
        )).filter(p => p !== address.toLowerCase());

        const participantUsers: User[] = [
          currentUser,
          ...uniqueParticipants.map(addr => ({
            address: addr,
            isWeb3MailEnabled: false,
            createdAt: Date.now(),
            lastSeen: Date.now()
          }))
        ];

        const chatData = {
          type: 'group' as const,
          name: formData.groupName.trim(),
          participants: participantUsers,
          participantAddresses: participantUsers.map(u => u.address.toLowerCase()).sort(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessage: null,
          unreadCount: Object.fromEntries(
            participantUsers.map(u => [u.address.toLowerCase(), 0])
          ),
          metadata: {
            createdBy: address.toLowerCase(),
            maxParticipants: 50,
            isArchived: false
          }
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        chatId = chatRef.id;
      } else {
        const recipientDoc = await getDoc(doc(db, 'users', formData.recipientAddress.toLowerCase()));
        const recipientUser: User = recipientDoc.exists()
          ? recipientDoc.data() as User
          : {
              address: formData.recipientAddress.toLowerCase(),
              isWeb3MailEnabled: false,
              createdAt: Date.now(),
              lastSeen: Date.now()
            };

        const chatData = {
          type: 'individual' as const,
          participants: [currentUser, recipientUser],
          participantAddresses: [address, formData.recipientAddress]
            .map(a => a.toLowerCase())
            .sort(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessage: null,
          unreadCount: {
            [address.toLowerCase()]: 0,
            [formData.recipientAddress.toLowerCase()]: 0
          },
          metadata: {
            isArchived: false
          }
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        chatId = chatRef.id;
      }

      onSuccess(chatId);
    } catch (error) {
      console.error('Error creating chat:', error);
      setErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Failed to create chat'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (existingChat) {
      setErrors([{
        field: 'general',
        message: 'A chat with this user already exists. Redirecting...'
      }]);
      const timer = setTimeout(() => {
        onSuccess(existingChatId!);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [existingChat, existingChatId, onSuccess]);

  return (
    <CreateChatForm
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      loading={loading}
      errors={errors}
      initialGroupChat={initialGroupChat}
      existingChatError={existingChat ? 'A chat with this user already exists. Redirecting...' : undefined}
    />
  );
};

export default CreateChat;