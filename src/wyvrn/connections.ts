
export enum ConnectionType {
	Server,
	Peer,
}
type ConnectionTypes = keyof typeof ConnectionType;

export enum ConnectionStatus {
	Pending,
	Requested,
	Connected,
	Rejected,
	Blocked,
	Muted,
}

export enum StatusCode {
	Offline,
	Online,
	Away,
	DoNotDisturb,
	Invisible, // Self only!!! Turns off ping responses, read indicators, ...
}

export interface SocialConnection {
	service: string
	icon: string
	link: string
	verified: boolean
}
type SocialConnections = SocialConnection[]

export abstract interface Connection {
  did: string
	connectionType: ConnectionTypes
	status: ConnectionStatus
	displayName?: string
  icon?: string
}

export interface Peer extends Connection {
	bio?: string
	note?: string
	nickname?: string
	statusCode?: StatusCode
	statusMessage?: string
	socials?: SocialConnections
}

export interface Server extends Connection {
	banner?: string
}

export abstract class ConnectionService {
  _selectedConnection?: Connection
  abstract getConnections(): Connection[]
  abstract getMessageHistory(did: string): Message[]
  abstract addConnection(contact: Connection): void
  abstract getConnection(did: string): Connection
  abstract saveMessageHistory(did: string, messages: Message[]): void
  abstract addMessage(did: string, message: Message): void
  selectConnection(contact: Connection): void {
    this._selectedConnection = contact
  }
  get selectedConnection(): Connection {
    return this._selectedConnection
  }
  onConnectionSelected(callback: (contact: Connection) => void): void {
    //eventbus.emit("contact-selected", callback)
  }
}
