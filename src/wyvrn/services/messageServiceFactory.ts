import { GLOBAL_PREFIX } from "../utils/constants";
import { exampleService, IChatMessage, IUser, IRole, IExampleService } from './exampleService';
import { agentService } from './agentService';

// Export common interfaces
export { IChatMessage, IUser, IRole } from './exampleService';

// Define the common interface used by both services
export interface IMessageServiceAdapter {
  getMessages(): IChatMessage[];
  getUsers(): Record<string, IUser>;
  getUser(id: string): IUser | undefined;
  getRoles?(): Record<string, IRole>;
  
  // Add any agent-specific methods needed
  processIncomingMessage?(message: any): Promise<void>;
}

// Example service adapter (mostly pass-through)
class ExampleServiceAdapter implements IMessageServiceAdapter {
  getMessages(): IChatMessage[] {
    return exampleService.getMessages();
  }
  
  getUsers(): Record<string, IUser> {
    return exampleService.getUsers();
  }
  
  getUser(username: string): IUser | undefined {
    return exampleService.getUser(username);
  }
  
  getRoles(): Record<string, IRole> {
    return exampleService.getRoles();
  }
}

// Agent service adapter
class AgentServiceAdapter implements IMessageServiceAdapter {
  private cachedMessages: IChatMessage[] = [];
  private cachedUsers: Record<string, IUser> = {};
  
  constructor() {
    // Initialize from agent service data
    this.refreshCache();
  }
  
  private async refreshCache() {
    // Convert agent messages to the common IChatMessage format
    try {
      const userDb = await agentService.getAllUsers();
      if (userDb) {
        this.cachedUsers = Object.entries(userDb).reduce((acc, [key, user]) => {
          acc[key] = {
            did: user.did,
            username: user.username,
            displayname: user.displayname,
            pfp: user.pfp || `https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`
          };
          return acc;
        }, {} as Record<string, IUser>);
      }
      
      // Get messages in a format compatible with IChatMessage
      const messages = await agentService.getAllMessages();
      if (messages) {
        this.cachedMessages = messages.map(msg => ({
          id: msg.id,
          username: msg.username,
          displayname: msg.displayname || msg.username,
          timestamp: msg.timestamp,
          message: msg.message,
          to: msg.metadata.originalPayload.to,
          from: msg.metadata.originalPayload.from,
        }));
      }
    } catch (error) {
      console.error('Error refreshing agent service cache', error);
    }
  }
  
  getMessages(): IChatMessage[] {
    return this.cachedMessages;
  }
  
  getUsers(): Record<string, IUser> {
    return this.cachedUsers;
  }
  
  getUser(username: string): IUser | undefined {
    return this.cachedUsers[username];
  }
  
  getRoles(): Record<string, IRole> {
    // Default roles if needed
    return {
      "User": { color: "#f1f" }
    };
  }
  
  async processIncomingMessage(message: any): Promise<void> {
    await agentService.processIncomingData(message);
    await this.refreshCache(); // Update cache after processing
  }
}

export enum MessageServiceType {
  EXAMPLE = 'example',
  AGENT = 'agent'
}

// Factory that creates the appropriate service adapter
export class MessageServiceFactory {
  private static adapter: IMessageServiceAdapter;
  private static currentType: MessageServiceType = 
    (localStorage.getItem(`${GLOBAL_PREFIX}message-service`) as MessageServiceType) || MessageServiceType.AGENT;

  static getService(type?: MessageServiceType): IMessageServiceAdapter {
    // If type is specified, create a new adapter of that type
    if (type && (!this.adapter || type !== this.currentType)) {
      this.currentType = type;
      localStorage.setItem(`${GLOBAL_PREFIX}message-service`, type); // Save to localStorage

      switch (type) {
        case MessageServiceType.EXAMPLE:
          this.adapter = new ExampleServiceAdapter();
          break;
        case MessageServiceType.AGENT:
          this.adapter = new AgentServiceAdapter();
          break;
        default:
          throw new Error(`Unknown message service type: ${type}`);
      }

      // Dispatch custom event to notify components
      const event = new CustomEvent('message-service-changed', { 
        detail: { 
          type: this.currentType,
          service: this.adapter 
        } 
      });
      window.dispatchEvent(event);
    }

    // If no type specified and no adapter exists, create default
    if (!this.adapter) {
      this.currentType = MessageServiceType.AGENT;
      this.adapter = new AgentServiceAdapter();
    }

    return this.adapter;
  }

  static getCurrentType(): MessageServiceType {
    return this.currentType;
  }
}

// Create a default instance for convenience
export const messageService = MessageServiceFactory.getService();
