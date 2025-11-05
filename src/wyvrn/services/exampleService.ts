const dummyData = {
	messages: [
		{
			"username": "frostyfrog",
			"displayname": "Frostyfrog",
			"id": "c8cc5441-2585-4653-b975-a5bfbbfe8b10",
			"timestamp": 1741974582076,
			"message": "Hello there!~",
			"to": ["did:example:neo", "did:example:nori"],
			"from": "did:example:frostyfrog",
		},
		{
			"username": "neo",
			"displayname": "NeoSaki",
			"id": "4d539a09-610b-4143-871d-6a7765ca065c",
			"timestamp": 1741974587616,
			"message": "Hi~",
			"to": ["did:example:frostyfrog", "did:example:nori"],
			"from": "did:example:neo",
		},
		{
			"username": "nori",
			"displayname": "Chiori",
			"id": "e5e9680e-29ac-458d-b467-bb401e578905",
			"timestamp": 1741978072349,
			"message": "Hi~",
			"to": ["did:example:frostyfrog", "did:example:neo"],
			"from": "did:example:nori",
		},
		{
			"username": "frostyfrog",
			"displayname": "Frostyfrog",
			"id": "5ed3c56a-7aa1-4f1b-af86-a74219ce1779",
			"timestamp": 1741978533702,
			"message": "So...",
			"to": ["did:example:nori", "did:example:neo"],
			"from": "did:example:frostyfrog",
		},
		{
			"username": "frostyfrog",
			"displayname": "Frostyfrog",
			"id": "fa1fc6e6-9ef8-4f02-bdc7-c52a137be942",
			"timestamp": 1741978535692,
			"message": "What are you up to?",
			"to": ["did:example:nori", "did:example:neo"],
			"from": "did:example:frostyfrog",
		},
		{
			"username": "neo",
			"displayname": "NeoSaki",
			"id": "7e4ff35f-2daf-41db-b091-4c62e27d506b",
			"timestamp": 1741978677668,
			"message": "Working on my Debut!",
			"to": ["did:example:frostyfrog", "did:example:nori"],
			"from": "did:example:neo",
		},
		// ...other messages...
	],
	users: {
		"frostyfrog" : {
			"username": "frostyfrog",
			"displayname": "Frostyfrog",
			"roles": ["Admin", "User"],
			"pfp": "https://pbs.twimg.com/profile_images/1612750469306404864/dBI1_-v9_400x400.jpg",
		},
		"neo" : {
			"username": "neo",
			"displayname": "NeoSaki",
			"roles": ["User"],
			"pfp": "https://pbs.twimg.com/profile_images/1802351709911453696/AXkramb8_400x400.jpg",
		},
		"nori" : {
			"username": "nori",
			"displayname": "Chiori Nouveau",
			"roles": ["User"],
			"pfp": "https://pbs.twimg.com/profile_images/1421605654863745028/OMl5gZ5P_400x400.jpg",
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
