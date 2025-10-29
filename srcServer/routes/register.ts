import { PutCommand } from '@aws-sdk/lib-dynamodb';
import express from 'express'
import type { Router, Request, Response } from 'express'
import { db, tableName } from '../data/dynamoDb.js';
import { createToken } from '../data/auth.js';
import type { JwtResponse, UserBody } from '../data/types.js';
import { genSalt, hash } from 'bcrypt'

const router: Router = express.Router();

router.post('/', async (req: Request<{}, JwtResponse, UserBody>, res: Response<JwtResponse>) => {
	// validera body
	// skapa ny användare mha RegisterBody -> PutCommand
	// skapa JWT med användarens id (hur får vi ett id?)
	// skicka tillbaka JWT och success=true

	// TODO: använd Zod för att kontrollera att body faktiskt är det vi förväntar oss
	const body: UserBody = req.body
	console.log('body', body)

	const newId = crypto.randomUUID()

	// Hasha lösenordet
	const salt: string = await genSalt()
	const hashed: string = await hash(body.password, salt)

	const command = new PutCommand({
		TableName: tableName,
		Item: {
			PK: 'USER#' + newId,
			SK: 'PROFILE',
			username: body.username,
			email: body.email,
			password: hashed,
			createdAt: new Date().toISOString()
		}
	})
	try {
		const result = await db.send(command)
		const token: string | null = createToken(newId)
		res.send({ success: true, token: token })

	} catch(error) {
		console.log(`register.ts fel:`, (error as any)?.message)
		res.status(500).send({ success: false })
	}

})

export default router
