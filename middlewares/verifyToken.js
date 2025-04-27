import jwt from 'jsonwebtoken'
import User from '../models/User.js';

export async function verifyAccessToken(req, res, next) {
    try {
        const authorization = req.headers.authorization // "Authorization": "Bearer fdsknfmlsdnfls"

        if (!authorization || !authorization.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token is not provided!' });
        }

        const token = authorization.split(' ')?.[1] // ['Bearer', 'token']
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decodedUser._doc._id)

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }

        req.user = user
        next()
    }
    catch {
        res.status(401).json({ message: 'Invalid token!' });
    }
}

export async function verifyRefreshToken(req, res, next) {
    try {
        const authorization = req.headers.authorization

        if (!authorization || !authorization.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token is not provided!' });
        }

        const refreshToken = authorization.split(' ')?.[1]
        const decodedUser = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        const user = await User.findById(decodedUser._doc._id)

        if (!user) {
            res.status(404).json({ message: 'User not found!' });
        }

        if (!decodedUser || refreshToken !== user.refreshToken) {
            return res.status(403).json({
                status: 403,
                message: 'Invalid refresh token!'
            });
        }

        req.user = user
        next()
    }
    catch (err) {
        console.log(err)
        res.status(401).json({ message: 'Invalid refresh token!' });
    }
}