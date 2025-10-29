import express from 'express'
import type { Router, Request, Response } from 'express'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import type { MessageItem, MessageBody } from '../data/types.js';

const router: Router = express.Router();

// GET /api/channels/:id/messages - hämta meddelanden från en kanal
router.get('/:channelId/messages', async (req: Request<{ channelId: string }>, res: Response<MessageItem[]>) => {
	const { channelId } = req.params
	console.log(`GET /api/channels/${channelId}/messages - listing messages`)

	const command = new QueryCommand({
		TableName: tableName,
		IndexName: 'ChannelMessages', // Använd GSI
		KeyConditionExpression: 'channelId = :channelId',
		ExpressionAttributeValues: {
			':channelId': channelId
		},
		ScanIndexForward: true // Äldsta meddelanden först
	})

	try {
		const output = await db.send(command)
		const messages: MessageItem[] = output.Items as MessageItem[] || []
		
		// Sortera efter timestamp (äldsta först)
		messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
		
		console.log(`Found ${messages.length} messages for channel ${channelId}`)
		res.send(messages)

	} catch(error) {
		console.log(`messages.ts GET fel:`, (error as any)?.message)
		res.status(500).send([])
	}
})

// POST /api/channels/:id/messages - skicka meddelande till kanal
router.post('/:channelId/messages', async (req: Request<{ channelId: string }, { success: boolean; messageId?: string }, MessageBody>, res: Response<{ success: boolean; messageId?: string }>) => {
	const { channelId } = req.params
	const body = req.body
	console.log(`POST /api/channels/${channelId}/messages - creating message`, body)

	if (!body.content || !body.senderId) {
		return res.status(400).send({ success: false });
	}

	const newMessageId = crypto.randomUUID()
	const now = new Date().toISOString()
	const timestamp = now

	const command = new PutCommand({
		TableName: tableName,
		Item: {
			PK: 'MESSAGE#' + newMessageId,
			SK: 'CHANNEL#' + channelId,
			channelId: channelId,
			timestamp: timestamp,
			senderId: body.senderId,
			content: body.content,
			messageType: 'channel'
		}
	})

	try {
		await db.send(command)
		console.log(`Created message: ${newMessageId} in channel ${channelId}`)
		return res.send({ success: true, messageId: newMessageId })

	} catch(error) {
		console.log(`messages.ts POST fel:`, (error as any)?.message)
		return res.status(500).send({ success: false })
	}
})

export default router
