// Används för body vid request: /login och /register
export interface UserBody {
	username: string;
	email: string;
	password: string;
}

export interface JwtResponse {
	success: boolean;
	token?: string;  // JWT
}

// Beskriver user-items från databasen
export interface UserItem {
	PK: string;
	SK: string;
	username: string;
	email: string;
	password: string;
	createdAt: string;
}

// Kanaler
export interface ChannelItem {
	PK: string;
	SK: string;
	channelName: string;
	isLocked: boolean;
	createdBy: string;
	createdAt: string;
}

// Meddelanden
export interface MessageItem {
	PK: string;
	SK: string;
	channelId: string;
	timestamp: string;
	senderId: string;
	senderUsername?: string; // Användarnamn (läggs till i backend)
	content: string;
	messageType: 'channel' | 'dm';
	recipientId?: string; // För DM
}

export interface MessageBody {
	content: string;
	senderId: string;
}

// DM-specifika interfaces
export interface DMBody {
	recipientUsername: string;
	content: string;
}

// Conversations interface för kombinerad lista
export interface ConversationItem {
	type: 'channel' | 'dm';
	id: string; // channelId eller username
	name: string; // channelName eller username
	lastMessage?: string;
	timestamp?: string;
	isLocked?: boolean; // bara för channels
	createdBy?: string; // bara för channels
}
