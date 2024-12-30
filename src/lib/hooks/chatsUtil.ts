interface ValidationError {
  field: string;
  message: string;
}

export interface CreateChatFormData {
  isGroup: boolean;
  recipientAddress: string;
  groupName: string;
  participants: string[];
}

export interface CreateChatFormProps {
  onSubmit: (data: CreateChatFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  errors?: ValidationError[];
  initialGroupChat?: boolean;
  existingChatError?: string;
}