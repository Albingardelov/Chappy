// Authentication / autentisering
import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || '';
function createToken(userId, accessLevel = 'user') {
    // Tiden sedan 1970-01-01 i sekunder
    const now = Math.floor(Date.now() / 1000);
    // En kvart
    const defaultExpiration = now + 15 * 60;
    return jwt.sign({
        userId: userId,
        accessLevel: accessLevel,
        exp: defaultExpiration
    }, jwtSecret);
}
function verifyToken(token) {
    try {
        return jwt.verify(token, jwtSecret);
    }
    catch (error) {
        return null;
    }
}
// Middleware för att verifiera JWT token
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }
    const token = authHeader.substring(7); // Ta bort 'Bearer '
    const decoded = verifyToken(token);
    if (!decoded) {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
    }
    // Lägg till användarinfo i request
    req.user = decoded;
    next();
}
// Optional auth middleware - sätter req.user om token finns, men blockerar inte
function optionalAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }
    next();
}
export { createToken, verifyToken, authMiddleware, optionalAuthMiddleware };
