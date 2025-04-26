import { IChatMessage, IUser, IRole, IMessage } from './exampleService';

export enum MessageType {
  TEXT = 'text',
  CALL = 'call',
  STATUS_UPDATE = 'status_update',
  NAME_CHANGE = 'name_change',
  FEATURE_ANNOUNCEMENT = 'feature_announcement',
  DIDCOMM_MESSAGE = 'didcomm_message',
}

export interface IAgentMessage extends IChatMessage {
  type: MessageType;
  metadata?: Record<string, any>;
}

export interface IWorkerMessagePayload {
  sender?: string;
  receiver?: string;
  message: IMessage;
  timestamp?: Date;
  raw?: any;
}

export interface IIndexedDBConfig {
  maxMessages?: number;
  maxUsers?: number;
  maxAgeInDays?: number;
}

export class AgentService {
  private db: IDBDatabase | null = null;
  private config: IIndexedDBConfig;

  constructor(config: IIndexedDBConfig = {}) {
    this.config = {
      maxMessages: config.maxMessages ?? 1000,
      maxUsers: config.maxUsers ?? 100,
      maxAgeInDays: config.maxAgeInDays ?? 30
    };
    this.initDatabase();
  }

  private async initDatabase() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('WyvernAgentDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { 
            keyPath: 'id', 
            autoIncrement: false 
          });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          messagesStore.createIndex('type', 'type', { unique: false });
          messagesStore.createIndex('sender', 'sender', { unique: false });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { 
            keyPath: 'username', 
            autoIncrement: false 
          });
          usersStore.createIndex('displayname', 'displayname', { unique: false });
        }

        // Metadata store for system-wide settings
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject(new Error('IndexedDB initialization error'));
      };
    });
  }

  private async pruneDatabase() {
    if (!this.db) await this.initDatabase();

    const tx = this.db!.transaction(['messages', 'users'], 'readwrite');
    const messageStore = tx.objectStore('messages');
    const userStore = tx.objectStore('users');

    // Prune messages older than configured max age
    if (this.config.maxAgeInDays) {
      const cutoffTimestamp = Date.now() - (this.config.maxAgeInDays * 24 * 60 * 60 * 1000);
      const timestampIndex = messageStore.index('timestamp');
      const rangeBound = IDBKeyRange.upperBound(cutoffTimestamp);
      
      const deleteRequest = timestampIndex.openCursor(rangeBound);
      deleteRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    }

    // Limit total number of messages
    if (this.config.maxMessages) {
      const countRequest = messageStore.count();
      countRequest.onsuccess = () => {
        const totalMessages = countRequest.result;
        if (totalMessages > this.config.maxMessages!) {
          // Logic to delete oldest messages
        }
      };
    }
  }

  public async saveMessage(message: IAgentMessage) {
    if (!this.db) await this.initDatabase();

    const tx = this.db!.transaction(['messages'], 'readwrite');
    const store = tx.objectStore('messages');
    
    store.add(message);
    
    // Periodically prune database
    if (Math.random() < 0.1) {  // 10% chance of pruning
      this.pruneDatabase();
    }
  }

  public async saveUser(user: IUser) {
    if (!this.db) await this.initDatabase();

    const tx = this.db!.transaction(['users'], 'readwrite');
    const store = tx.objectStore('users');
    
    store.put(user);
  }

  public async saveWorkerMessage(payload: IWorkerMessagePayload): Promise<IAgentMessage> {
    const { message, sender, receiver } = payload;
    
    // First, ensure we have the user in our database
    if (sender) {
      await this.ensureUserExists(sender, message.from);
    }
    
    // Create an agent message from the DIDComm message
    const agentMessage: IAgentMessage = {
      id: message.id || crypto.randomUUID(),
      username: message.from || 'unknown',
      displayname: sender || message.from || 'Unknown',
      timestamp: message.created_time || Date.now(),
      message: message.body?.content || JSON.stringify(message.body),
      type: MessageType.DIDCOMM_MESSAGE,
      metadata: {
        originalType: message.type,
        payload: message,
        receiver: receiver
      }
    };
    
    await this.saveMessage(agentMessage);
    return agentMessage;
  }

  private async ensureUserExists(displayName: string, did: string) {
    const user: IUser = {
      username: did,
      displayname: displayName,
      pfp: `https://api.dicebear.com/7.x/personas/svg?seed=${did}` // Generate placeholder avatar
    };
    
    await this.saveUser(user);
  }

  public async processIncomingData(data: any) {
    // Handle different types of incoming data
    if (data.message && typeof data.message === 'object') {
      // This looks like a worker message
      return await this.saveWorkerMessage(data);
    }
    
    switch (data.type) {
      case MessageType.TEXT:
        await this.saveMessage(data);
        break;
      case MessageType.NAME_CHANGE:
        // Update user without storing the change event
        await this.saveUser({
          username: data.username, 
          displayname: data.newDisplayName,
          pfp: data.currentPfp
        });
        break;
      case MessageType.FEATURE_ANNOUNCEMENT:
        // Store metadata about supported features
        await this.saveFeatureMetadata(data);
        break;
      // Add more handlers as needed
    }
  }

  private async saveFeatureMetadata(featureData: any) {
    if (!this.db) await this.initDatabase();

    const tx = this.db!.transaction(['metadata'], 'readwrite');
    const store = tx.objectStore('metadata');
    
    store.put({
      key: `features_${featureData.username}`,
      value: featureData.features
    });
  }
  
  // Get messages for a specific sender
  public async getMessagesForSender(senderDid: string): Promise<IAgentMessage[]> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['messages'], 'readonly');
      const store = tx.objectStore('messages');
      const index = store.index('sender');
      const request = index.getAll(senderDid);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve messages'));
      };
    });
  }

  public async getAllUsers(): Promise<Record<string, IUser>> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['users'], 'readonly');
      const store = tx.objectStore('users');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const users = request.result;
        const userMap = users.reduce((acc, user) => {
          acc[user.username] = user;
          return acc;
        }, {} as Record<string, IUser>);
        resolve(userMap);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve users'));
      };
    });
  }
  
  public async getAllMessages(): Promise<IAgentMessage[]> {
    if (!this.db) await this.initDatabase();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['messages'], 'readonly');
      const store = tx.objectStore('messages');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error('Failed to retrieve messages'));
      };
    });
  }

  public async processMessage(message: any): Promise<IAgentMessage> {
    const processedMessage: IAgentMessage = {
      id: message.id || crypto.randomUUID(),
      username: message.from || 'unknown',
      displayname: message.body?.profile?.displayName || message.from || 'Unknown',
      timestamp: message.created_time || Date.now(),
      message: message.body?.content || JSON.stringify(message.body),
      type: MessageType.DIDCOMM_MESSAGE,
      metadata: {
        originalType: message.type,
        originalPayload: message
      }
    };
    
    await this.saveMessage(processedMessage);
    return processedMessage;
  }
}

export const agentService = new AgentService();
