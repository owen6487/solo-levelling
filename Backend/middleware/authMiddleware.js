const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token ||(req.headers.authorization ?.startsWith("Bearer") ? req.headers.authorization.split(" ")[1]:null)
        if (!token) {
            return res.status(401).json({ message: "No token provided. Access denied." });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;