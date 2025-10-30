import express from 'express';
import { ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { authMiddleware, optionalAuthMiddleware } from '../data/auth.js';
const router = express.Router();
// GET /api/channels - lista alla kanaler (filtrera låsta kanaler för gäster)
router.get('/', optionalAuthMiddleware, async (req, res) => {
    console.log('GET /api/channels - listing all channels');
    const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(PK, :value)',
        ExpressionAttributeValues: {
            ':value': 'CHANNEL#' // Sök på alla kanaler
        }
    });
    try {
        const output = await db.send(command);
        const allChannels = output.Items || [];
        // Filtrera låsta kanaler om användaren inte är inloggad
        const isAuthenticated = req.user !== undefined;
        console.log('req.user:', req.user);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('allChannels count:', allChannels.length);
        const channels = isAuthenticated
            ? allChannels // Inloggade användare ser alla kanaler
            : allChannels.filter(channel => !channel.isLocked); // Gäster ser bara öppna kanaler
        console.log(`Found ${channels.length} channels (${isAuthenticated ? 'authenticated' : 'guest'} user)`);
        res.send(channels);
    }
    catch (error) {
        console.log(`channels.ts GET fel:`, error?.message);
        res.status(500).send([]);
    }
});
// POST /api/channels - skapa ny kanal (VG-funktion) - kräver inloggning
router.post('/', authMiddleware, async (req, res) => {
    const body = req.body;
    console.log('POST /api/channels - creating channel', body);
    if (!body.name) {
        return res.status(400).send({ success: false });
    }
    const newChannelId = crypto.randomUUID();
    const now = new Date().toISOString();
    const command = new PutCommand({
        TableName: tableName,
        Item: {
            PK: 'CHANNEL#' + newChannelId,
            SK: 'PROFILE',
            channelId: newChannelId,
            channelName: body.name,
            description: body.description || '',
            isLocked: body.isLocked || false,
            createdBy: req.user?.userId || 'unknown', // Använd inloggad användare
            createdAt: now
        }
    });
    try {
        await db.send(command);
        console.log(`Created channel: ${newChannelId}`);
        return res.send({ success: true, channelId: newChannelId });
    }
    catch (error) {
        console.log(`channels.ts POST fel:`, error?.message);
        return res.status(500).send({ success: false });
    }
});
// DELETE /api/channels/:id - ta bort kanal (bara den som skapade)
router.delete('/:channelId', authMiddleware, async (req, res) => {
    const channelId = req.params.channelId;
    const currentUserId = req.user?.userId;
    console.log(`DELETE /api/channels/${channelId} - deleting channel by user ${currentUserId}`);
    if (!currentUserId) {
        return res.status(401).send({ success: false, message: 'Not authenticated' });
    }
    try {
        // Först kontrollera att kanalen finns och att användaren skapade den
        const checkCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'PK = :pk AND SK = :sk',
            ExpressionAttributeValues: {
                ':pk': 'CHANNEL#' + channelId,
                ':sk': 'PROFILE'
            }
        });
        const checkResult = await db.send(checkCommand);
        if (!checkResult.Items || checkResult.Items.length === 0) {
            return res.status(404).send({ success: false, message: 'Channel not found' });
        }
        const channel = checkResult.Items[0];
        if (channel.createdBy !== currentUserId) {
            return res.status(403).send({ success: false, message: 'Only the creator can delete this channel' });
        }
        // Ta bort kanalen
        const deleteCommand = new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: 'CHANNEL#' + channelId,
                SK: 'PROFILE'
            }
        });
        await db.send(deleteCommand);
        console.log(`Deleted channel: ${channelId}`);
        return res.send({ success: true });
    }
    catch (error) {
        console.log(`channels.ts DELETE fel:`, error?.message);
        return res.status(500).send({ success: false, message: 'Could not delete channel' });
    }
});
export default router;
