import express from 'express'
import type { Express, Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './middleware.js'
import { authMiddleware } from './data/auth.js'
import registerRouter from './routes/register.js'
import loginRouter from './routes/login.js'
import channelsRouter from './routes/channels.js'
import messagesRouter from './routes/messages.js'
import dmRouter from './routes/dm.js'
import conversationsRouter from './routes/conversations.js'
import usersRouter from './routes/users.js'

// Konfiguration
const app: Express = express()
const port: number = Number(process.env.PORT) || 1337

// Hämta __dirname i ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// DM routes
app.use('/api/dm', dmRouter)

// Conversations routes
app.use('/api/conversations', conversationsRouter)

// Users routes
app.use('/api/users', usersRouter)

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

// Servera statiska filer från dist-mappen (byggd frontend)
const distPath = path.join(__dirname, '../../dist')
app.use(express.static(distPath))

// Alla routes som inte är /api/* ska servera index.html (för React Router)
app.get('*', (req: Request, res: Response) => {
	// Om det är en API-route, returnera 404
	if (req.path.startsWith('/api')) {
		return res.status(404).json({ error: 'API route not found' })
	}
	// Annars servera index.html
	return res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}...`)
}).on('error', (err) => {
	console.log('Server could not start! ', (err as Error).message)
})
