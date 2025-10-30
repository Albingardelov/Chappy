import express from 'express';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { authMiddleware } from '../data/auth.js';
const router = express.Router();
// POST /api/dm - skicka direktmeddelande (kräver inloggning)
router.post('/', authMiddleware, async (req, res) => {
    const body = req.body;
    const senderId = req.user?.userId;
    console.log(`POST /api/dm - sending DM from ${senderId} to ${body.recipientUsername}`);
    if (!body.recipientUsername || !body.content) {
        return res.status(400).send({ success: false, message: 'Missing recipientUsername or content' });
    }
    if (!senderId) {
        return res.status(401).send({ success: false, message: 'Not authenticated' });
    }
    // Kontrollera att mottagaren finns via username
    const checkUserCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(PK, :value) AND username = :username',
        ExpressionAttributeValues: {
            ':value': 'USER#',
            ':username': body.recipientUsername
        }
    });
    try {
        const userCheck = await db.send(checkUserCommand);
        if (!userCheck.Items || userCheck.Items.length === 0) {
            return res.status(404).send({ success: false, message: 'Recipient not found' });
        }
        // Hämta mottagarens userId från PK
        const recipientUser = userCheck.Items[0];
        if (!recipientUser) {
            return res.status(404).send({ success: false, message: 'Recipient not found' });
        }
        const recipientUserId = recipientUser.PK.replace('USER#', '');
        // Skapa DM med båda userIds
        const newMessageId = crypto.randomUUID();
        const now = new Date().toISOString();
        const timestamp = now;
        const dmCommand = new PutCommand({
            TableName: tableName,
            Item: {
                PK: 'MESSAGE#' + newMessageId,
                SK: `DM#${senderId}#${recipientUserId}`,
                senderId: senderId,
                recipientId: recipientUserId,
                content: body.content,
                messageType: 'dm',
                timestamp: timestamp
            }
        });
        await db.send(dmCommand);
        console.log(`Created DM: ${newMessageId} from ${senderId} to ${recipientUserId}`);
        return res.send({ success: true, messageId: newMessageId });
    }
    catch (error) {
        console.log(`dm.ts user check fel:`, error?.message);
        return res.status(500).send({ success: false, message: 'Could not verify recipient' });
    }
});
// GET /api/dm/:username - hämta DM-historik mellan två användare (kräver inloggning)
router.get('/:username', authMiddleware, async (req, res) => {
    const otherUsername = req.params.username;
    const currentUserId = req.user?.userId;
    console.log(`GET /api/dm/${otherUsername} - getting DM history between ${currentUserId} and ${otherUsername}`);
    if (!currentUserId) {
        return res.status(401).send([]);
    }
    // Hitta andra användarens userId via username
    const findUserCommand = new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(PK, :value) AND username = :username',
        ExpressionAttributeValues: {
            ':value': 'USER#',
            ':username': otherUsername
        }
    });
    try {
        const userResult = await db.send(findUserCommand);
        if (!userResult.Items || userResult.Items.length === 0) {
            return res.status(404).send([]);
        }
        const otherUser = userResult.Items[0];
        if (!otherUser) {
            return res.status(404).send([]);
        }
        const otherUserId = otherUser.PK.replace('USER#', '');
        // Hämta DM i båda riktningar
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'begins_with(PK, :value) AND messageType = :dmType AND (senderId = :currentUser AND recipientId = :otherUser) OR (senderId = :otherUser AND recipientId = :currentUser)',
            ExpressionAttributeValues: {
                ':value': 'MESSAGE#',
                ':dmType': 'dm',
                ':currentUser': currentUserId,
                ':otherUser': otherUserId
            }
        });
        const output = await db.send(command);
        const messages = output.Items || [];
        // Sortera efter timestamp (äldsta först)
        messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        console.log(`Found ${messages.length} DM messages between ${currentUserId} and ${otherUserId}`);
        return res.send(messages);
    }
    catch (error) {
        console.log(`dm.ts GET fel:`, error?.message);
        return res.status(500).send([]);
    }
});
export default router;
