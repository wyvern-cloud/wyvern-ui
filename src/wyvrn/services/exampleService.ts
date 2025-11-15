const dummyData = {
	messages: [
		{
			"username": "jake",
			"displayname": "Jake Smith",
			"id": "c8cc5441-2585-4653-b975-a5bfbbfe8b10",
			"timestamp": 1741974582076,
			"message": "Hello there!~",
			"to": ["did:example:jane", "did:example:lila"],
			"from": "did:example:jake",
		},
		{
			"username": "jane",
			"displayname": "Jane Doe",
			"id": "4d539a09-610b-4143-871d-6a7765ca065c",
			"timestamp": 1741974587616,
			"message": "Hi~",
			"to": ["did:example:jake", "did:example:lila"],
			"from": "did:example:jane",
		},
		{
			"username": "lila",
			"displayname": "Lila Barnes",
			"id": "e5e9680e-29ac-458d-b467-bb401e578905",
			"timestamp": 1741978072349,
			"message": "Hi~",
			"to": ["did:example:jake", "did:example:jane"],
			"from": "did:example:lila",
		},
		{
			"username": "jake",
			"displayname": "Jake Smith",
			"id": "5ed3c56a-7aa1-4f1b-af86-a74219ce1779",
			"timestamp": 1741978533702,
			"message": "So...",
			"to": ["did:example:lila", "did:example:jane"],
			"from": "did:example:jake",
		},
		{
			"username": "jake",
			"displayname": "Jake Smith",
			"id": "fa1fc6e6-9ef8-4f02-bdc7-c52a137be942",
			"timestamp": 1741978535692,
			"message": "What are you up to?",
			"to": ["did:example:lila", "did:example:jane"],
			"from": "did:example:jake",
		},
		{
			"username": "jane",
			"displayname": "Jane Doe",
			"id": "7e4ff35f-2daf-41db-b091-4c62e27d506b",
			"timestamp": 1741978677668,
			"message": "Working on my Debut!",
			"to": ["did:example:jake", "did:example:lila"],
			"from": "did:example:jane",
		},
		// ...other messages...
	],
	users: {
		"jake" : {
			"username": "jake",
			"displayname": "Jake Smith",
			"roles": ["Admin", "User"],
			"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=jake",
		},
		"jane" : {
			"username": "jane",
			"displayname": "Jane Doe",
			"roles": ["User"],
			"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=jane",
		},
		"lila" : {
			"username": "lila",
			"displayname": "Lila Barnes",
			"roles": ["User"],
			"pfp": "https://api.dicebear.com/7.x/personas/svg?seed=lila",
		},
		// ...other users...
	},
	roles: {
		"Admin": { color: "#93f" },
		"User": { color: "#f1f" },
	},
};

// Base interfaces for common entities
export interface IChatMessage {
	username: string;
	displayname: string;
	id: string;
	timestamp: number;
	message: string;
}

export interface IUser {
	username: string;
	displayname: string;
	roles?: string[];
	pfp: string;
}

export interface IRole {
	color: string;
}

// Base messaging service with common functionality
export interface IBaseMessageService {
	getMessages: () => IChatMessage[];
}

// User management interface that can be reused
export interface IUserManagement {
	getUsers: () => Record<string, IUser>;
	getUser: (username: string) => IUser | undefined;
}

// Refined messaging context interfaces
export interface ICommunityHubService extends IBaseMessageService, IUserManagement {
	getRoles: () => Record<string, IRole>;
}

export interface IDirectMessageService extends IBaseMessageService {
	getOtherUser: () => IUser;
}

export interface IGroupMessageService extends IBaseMessageService, IUserManagement {
	// No additional methods needed as IUserManagement covers participants
}

// Combined service interface
export interface IExampleService extends ICommunityHubService {
	// Additional methods that might be specific to the example service
}

export const exampleService: IExampleService = {
	getMessages: () => dummyData.messages,
	getUsers: () => dummyData.users,
	getUser: (username) => dummyData.users[username],
	getRoles: () => dummyData.roles,
};
