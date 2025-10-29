import express from 'express'
import type { Router, Request, Response } from 'express'
import { createToken } from '../data/auth.js';
import type { JwtResponse, UserBody, UserItem } from '../data/types.js';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { db, tableName } from '../data/dynamoDb.js';
import { compare } from 'bcrypt'

const router: Router = express.Router();

router.post('/', async (req: Request<{}, JwtResponse | void, UserBody>, res: Response<JwtResponse | void>) => {
	// validera body
	// finns användaren i databasen? QueryCommand
	// matchar lösenordet?
	// om ja, skapa JWT och skicka tillbaka
	// om nej, svara med status 401

	// TODO: använd Zod för att kontrollera body
	const body: UserBody = req.body
	console.log('body', body)

	const command = new ScanCommand({
		TableName: tableName,
		FilterExpression: 'begins_with(PK, :value)',
		ExpressionAttributeValues: {
			':value': 'USER#'  // Sök på alla användare
		}
	})
	const output = await db.send(command)
	if( !output.Items ) {
		console.log('No items from db')
		res.sendStatus(404)
		return
	}

	// TODO: validera items med zod
	const users: UserItem[] = output.Items as UserItem[]
	const found: UserItem | undefined = users.find(user => user.username === body.username)
	if( !found ) {
		console.log('No matching user')
		res.sendStatus(401)
		return
	}
	// vi har hittat en användare - men stämmer lösenordet?
	const passwordMatch: boolean = await compare(body.password, found.password)
	if( !passwordMatch ) {
		console.log('Wrong password', body.password, found.password)
		res.sendStatus(401)
		return
	}

	// sk = 'USER#id'
	console.log('Found user', found)
	const userId = found.PK.substring(5) // Ta bort 'USER#' från början
	const token: string = createToken(userId, 'user') // Default access level
	res.send({ success: true, token: token })
})

export default router
