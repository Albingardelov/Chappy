// Authentication / autentisering

import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

// Extend Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: any
		}
	}
}

const jwtSecret: string = process.env.JWT_SECRET || ''

function createToken(userId: string, accessLevel: string = 'user'): string {
	// Tiden sedan 1970-01-01 i sekunder
	const now = Math.floor(Date.now() / 1000)

	// En kvart
	const defaultExpiration: number = now + 15 * 60
	return jwt.sign({
		userId: userId,
		accessLevel: accessLevel,
		exp: defaultExpiration
	}, jwtSecret)
}

function verifyToken(token: string): any {
	try {
		return jwt.verify(token, jwtSecret)
	} catch (error) {
		return null
	}
}

// Middleware för att verifiera JWT token
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization
	
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ success: false, message: 'No token provided' })
		return
	}
	
	const token = authHeader.substring(7) // Ta bort 'Bearer '
	const decoded = verifyToken(token)
	
	if (!decoded) {
		res.status(401).json({ success: false, message: 'Invalid token' })
		return
	}
	
	// Lägg till användarinfo i request
	req.user = decoded
	next()
}

// Optional auth middleware - sätter req.user om token finns, men blockerar inte
function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization
	
	if (authHeader && authHeader.startsWith('Bearer ')) {
		const token = authHeader.substring(7)
		const decoded = verifyToken(token)
		if (decoded) {
			req.user = decoded
		}
	}
	
	next()
}

export { createToken, verifyToken, authMiddleware, optionalAuthMiddleware }
