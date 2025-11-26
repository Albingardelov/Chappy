import express from 'express'
import type { Router, Request, Response } from 'express'
import { DeleteCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { authMiddleware, optionalAuthMiddleware } from '../data/auth.js';
import type { UserItem } from '../data/types.js';

const router: Router = express.Router();

// GET /api/users - hämta lista över alla användare (tillgängligt för alla, inklusive gäster)
router.get('/', optionalAuthMiddleware, async (req: Request<{}, { users: Array<{ username: string }> } | { error: string }>, res: Response<{ users: Array<{ username: string }> } | { error: string }>) => {
    const currentUserId = req.user?.userId
    const isAuthenticated = req.user !== undefined
    console.log(`GET /api/users - listing all users (requested by ${isAuthenticated ? currentUserId : 'guest'})`)

    try {
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: 'begins_with(PK, :value)',
            ExpressionAttributeValues: {
                ':value': 'USER#'
            }
        })

        const output = await db.send(command)
        const users: UserItem[] = output.Items as UserItem[] || []
        
        // Returnera bara username, inte lösenord eller annan känslig data
        const userList = users
            .filter(user => {
                // Exkludera den nuvarande användaren från listan (om inloggad)
                if (isAuthenticated && currentUserId) {
                    const userId = user.PK.replace('USER#', '')
                    return userId !== currentUserId
                }
                // Gäster ser alla användare
                return true
            })
            .map(user => ({
                username: user.username
            }))

        console.log(`Found ${userList.length} users`)
        return res.send({ users: userList })

    } catch(error) {
        console.log(`users.ts GET fel:`, (error as any)?.message)
        return res.status(500).send({ error: 'Could not fetch users' })
    }
})

// DELETE /api/users - ta bort användarens eget konto (VG-funktion)
router.delete('/', authMiddleware, async (req: Request<{}, { success: boolean; message?: string }>, res: Response<{ success: boolean; message?: string }>) => {
    const currentUserId = req.user?.userId
    console.log(`DELETE /api/users - deleting user account ${currentUserId}`)

    if (!currentUserId) {
        return res.status(401).send({ success: false, message: 'Not authenticated' })
    }

    try {
        // Använd PK direkt: 'USER#' + userId (userId kommer från JWT)
        const userPK = 'USER#' + currentUserId

        // Kontrollera att användaren finns innan vi försöker ta bort
        const checkUserCommand = new GetCommand({
            TableName: tableName,
            Key: {
                PK: userPK,
                SK: 'PROFILE'
            }
        })

        const userResult = await db.send(checkUserCommand)
        if (!userResult.Item) {
            console.log(`User not found: ${userPK}`)
            return res.status(404).send({ success: false, message: 'User not found' })
        }

        // Ta bort användarens profil
        const deleteUserCommand = new DeleteCommand({
            TableName: tableName,
            Key: {
                PK: userPK,
                SK: 'PROFILE'
            }
        })

        await db.send(deleteUserCommand)
        console.log(`Deleted user account: ${currentUserId}`)
        return res.send({ success: true, message: 'Account deleted successfully' })

    } catch(error) {
        console.log(`users.ts DELETE fel:`, (error as any)?.message)
        return res.status(500).send({ success: false, message: 'Could not delete account' })
    }
})

export default router
