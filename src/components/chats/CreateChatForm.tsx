import { CreateChatFormProps } from '@/src/lib/hooks/chatsUtil';
import React, { useState } from 'react';
import { Button } from '../ui/button';




export const CreateChatForm: React.FC<CreateChatFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  errors = [],
  initialGroupChat = false,
  existingChatError
}) => {
  const [isGroup, setIsGroup] = useState(initialGroupChat);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      isGroup,
      recipientAddress,
      groupName,
      participants
    });
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isGroup ? 'Create Group Chat' : 'Start New Chat'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialGroupChat && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <input
              type="checkbox"
              id="groupChat"
              checked={isGroup}
              onChange={(e) => {
                setIsGroup(e.target.checked);
                if (e.target.checked) {
                  setRecipientAddress('');
                } else {
                  setGroupName('');
                  setParticipants([]);
                }
              }}
              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <label htmlFor="groupChat" className="text-sm font-medium text-gray-700">
              Create Group Chat
            </label>
          </div>
        )}

        {isGroup ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                  getFieldError('groupName') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter group name"
                maxLength={50}
              />
              {getFieldError('groupName') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('groupName')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Addresses
                <span className="text-gray-500 ml-1">(one per line)</span>
              </label>
              <textarea
                value={participants.join('\n')}
                onChange={(e) => setParticipants(e.target.value.split('\n').filter(Boolean))}
                className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                  getFieldError('participants') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter participant addresses"
                rows={4}
              />
              {getFieldError('participants') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('participants')}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 2 participants required
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                getFieldError('recipientAddress') 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter wallet address"
            />
            {getFieldError('recipientAddress') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('recipientAddress')}</p>
            )}
          </div>
        )}

        {(getFieldError('general') || existingChatError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {getFieldError('general') || existingChatError}
            </p>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </div>
            ) : (
              'Create Chat'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateChatForm;