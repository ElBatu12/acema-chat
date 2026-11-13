export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface MessageSender {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  sender: MessageSender;
  created_at: string;
}

export interface Chat {
  id: string;
  name: string | null;
  participants: User[];
  last_message: Message | null;
  created_at: string;
}
