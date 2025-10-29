import express from 'express'
import type { Router, Request, Response } from 'express'
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import type { ConversationItem } from '../data/types.js';
import { authMiddleware, optionalAuthMiddleware } from '../data/auth.js';

const router: Router = express.Router();

// GET /api/conversations - hämta alla konversationer (kanaler + DM) för användaren
router.get('/', optionalAuthMiddleware, async (req: Request, res: Response<ConversationItem[]>) => {
    const currentUserId = req.user?.userId
    const isAuthenticated = req.user !== undefined
    console.log(`GET /api/conversations - getting all conversations for ${isAuthenticated ? 'authenticated' : 'guest'} user`)

    try {
        const conversations: ConversationItem[] = []

        // 1. Hämta alla kanaler
        const channelsCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'begins_with(PK, :value)',
            ExpressionAttributeValues: {
                ':value': 'CHANNEL#'
            }
        })

        const channelsResult = await db.send(channelsCommand)
        const allChannels = channelsResult.Items || []
        
        // Filtrera låsta kanaler för gäster
        const visibleChannels = isAuthenticated 
            ? allChannels  // Inloggade användare ser alla kanaler
            : allChannels.filter(channel => !channel.isLocked)  // Gäster ser bara öppna kanaler

        // Lägg till kanaler i conversations
        for (const channel of visibleChannels) {
            conversations.push({
                type: 'channel',
                id: channel.channelId || channel.PK.replace('CHANNEL#', ''),
                name: channel.channelName || 'Unknown Channel',
                isLocked: channel.isLocked || false,
                createdBy: channel.createdBy
            })
        }

        // 2. Hämta DM-konversationer (bara för inloggade användare)
        if (isAuthenticated && currentUserId) {
            const dmCommand = new ScanCommand({
                TableName: tableName,
                FilterExpression: 'begins_with(PK, :value) AND messageType = :dmType AND (senderId = :currentUser OR recipientId = :currentUser)',
                ExpressionAttributeValues: {
                    ':value': 'MESSAGE#',
                    ':dmType': 'dm',
                    ':currentUser': currentUserId
                }
            })

            const dmResult = await db.send(dmCommand)
            const dmMessages = dmResult.Items || []
            
            // Gruppera DM per användare
            const dmUsers = new Set<string>()
            for (const message of dmMessages) {
                const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId
                if (otherUserId) {
                    dmUsers.add(otherUserId)
                }
            }

            // Hämta användarnamn för DM-användare
            for (const userId of dmUsers) {
                const userCommand = new ScanCommand({
                    TableName: tableName,
                    FilterExpression: 'begins_with(PK, :value) AND PK = :userPk',
                    ExpressionAttributeValues: {
                        ':value': 'USER#',
                        ':userPk': 'USER#' + userId
                    }
                })

                const userResult = await db.send(userCommand)
                if (userResult.Items && userResult.Items.length > 0) {
                    const user = userResult.Items[0]
                    if (user) {
                        conversations.push({
                            type: 'dm',
                            id: user.username || 'unknown',
                            name: user.username || 'Unknown User'
                        })
                    }
                }
            }
        }

        console.log(`Found ${conversations.length} conversations (${conversations.filter(c => c.type === 'channel').length} channels, ${conversations.filter(c => c.type === 'dm').length} DMs)`)
        res.send(conversations)

    } catch(error) {
        console.log(`conversations.ts GET fel:`, (error as any)?.message)
        res.status(500).send([])
    }
})

export default router
