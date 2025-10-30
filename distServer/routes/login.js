import express from 'express';
import { createToken } from '../data/auth.js';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { compare } from 'bcrypt';
const router = express.Router();
router.post('/', async (req, res) => {
    // validera body
    // finns användaren i databasen? QueryCommand
    // matchar lösenordet?
    // om ja, skapa JWT och skicka tillbaka
    // om nej, svara med status 401
    // TODO: använd Zod för att kontrollera body
    const body = req.body;
    console.log('body', body);
    const command = new ScanCommand({
        TableName: tableName,
        FilterExpression: 'begins_with(PK, :value)',
        ExpressionAttributeValues: {
            ':value': 'USER#' // Sök på alla användare
        }
    });
    const output = await db.send(command);
    if (!output.Items) {
        console.log('No items from db');
        res.sendStatus(404);
        return;
    }
    // TODO: validera items med zod
    const users = output.Items;
    const found = users.find(user => user.username === body.username);
    if (!found) {
        console.log('No matching user');
        res.sendStatus(401);
        return;
    }
    // vi har hittat en användare - men stämmer lösenordet?
    const passwordMatch = await compare(body.password, found.password);
    if (!passwordMatch) {
        console.log('Wrong password', body.password, found.password);
        res.sendStatus(401);
        return;
    }
    // sk = 'USER#id'
    console.log('Found user', found);
    const userId = found.PK.substring(5); // Ta bort 'USER#' från början
    const token = createToken(userId, 'user'); // Default access level
    res.send({ success: true, token: token });
});
export default router;
