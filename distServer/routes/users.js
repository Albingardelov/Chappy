import express from 'express';
import { DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { authMiddleware } from '../data/auth.js';
const router = express.Router();
// DELETE /api/users - ta bort användarens eget konto (VG-funktion)
router.delete('/', authMiddleware, async (req, res) => {
    const currentUserId = req.user?.userId;
    console.log(`DELETE /api/users - deleting user account ${currentUserId}`);
    if (!currentUserId) {
        return res.status(401).send({ success: false, message: 'Not authenticated' });
    }
    try {
        // Hitta användarens PK via userId
        const findUserCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'begins_with(PK, :value) AND userId = :userId',
            ExpressionAttributeValues: {
                ':value': 'USER#',
                ':userId': currentUserId
            }
        });
        const userResult = await db.send(findUserCommand);
        if (!userResult.Items || userResult.Items.length === 0) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        const user = userResult.Items[0];
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        const userPK = user.PK;
        // Ta bort användarens profil
        const deleteUserCommand = new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: userPK,
                SK: 'PROFILE'
            }
        });
        await db.send(deleteUserCommand);
        console.log(`Deleted user account: ${currentUserId}`);
        return res.send({ success: true, message: 'Account deleted successfully' });
    }
    catch (error) {
        console.log(`users.ts DELETE fel:`, error?.message);
        return res.status(500).send({ success: false, message: 'Could not delete account' });
    }
});
export default router;
