import express from 'express'
import type { Express, Request, Response } from 'express'
import cors from 'cors'
import { logger } from './middleware.js'
import { authMiddleware } from './data/auth.js'
import registerRouter from './routes/register.js'
import loginRouter from './routes/login.js'
import channelsRouter from './routes/channels.js'
import messagesRouter from './routes/messages.js'

// Konfiguration
const app: Express = express()
const port: number = Number(process.env.PORT) || 1337

// Middleware
app.use(cors())
app.use(express.json())
app.use('/', logger)

// Auth routes
app.use('/api/register', registerRouter)
app.use('/api/login', loginRouter)

// Channels routes
app.use('/api/channels', channelsRouter)

// Messages routes (shares /api/channels prefix)
app.use('/api/channels', messagesRouter)

// Debug routes
app.get('/api/ping', (req: Request, res: Response) => {
	res.send({ message: 'Pong' })
})

// Skyddad route för att testa JWT middleware
app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
	res.json({ 
		message: 'This is a protected route',
		user: req.user 
	})
})

app.listen(port, (error) => {
	if( error ) {
		console.log('Server could not start! ', error.message)
	} else {
		console.log(`Server is listening on port ${port}...`)
	}
})
