import { IMessage } from 'didcomm';

// UI/Chat Message 
export interface IChatMessage {
  username: string;
  displayname: string;
  id: string;
  timestamp: number;
  message: string;
}

// Worker Message related types
export interface IWorkerContact {
  did: string;
  label?: string;
  icon?: string;
}

export interface IWorkerMessage {
  sender: string | IWorkerContact;
  receiver: string | IWorkerContact;
  timestamp: Date;
  content: string;
  type?: string;
  raw?: any;
}

export interface IAgentMessageEvent {
  sender?: IWorkerContact;
  receiver?: IWorkerContact;
  message: IMessage;
}

// Application Message Types
export enum AppMessageType {
  TEXT = 'text',
  CALL = 'call',
  STATUS_UPDATE = 'status_update',
  NAME_CHANGE = 'name_change',
  FEATURE_ANNOUNCEMENT = 'feature_announcement',
  DIDCOMM_MESSAGE = 'didcomm_message',
}

// Enhanced message that can be used across the application
export interface IAppMessage extends IChatMessage {
  type: AppMessageType;
  metadata?: Record<string, any>;
  originalMessage?: IWorkerMessage | IMessage;
}
