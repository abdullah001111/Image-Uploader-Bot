export interface Update {
    update_id: number;
    message?: Message;
  }
  
  export interface Message {
    message_id: number;
    from?: User;
    chat: Chat;
    text?: string;
    photo?: PhotoSize[];
  }
  
  export interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  }
  
  export interface Chat {
    id: number;
    type: string;
  }
  
  export interface PhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  }