import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import generateTokens from '../utils/generateTokens.js'
import {verifyAccessToken, verifyRefreshToken} from '../middlewares/verifyToken.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body

        if(!username) {
            res.status(400).json({
                status: 400,
                message: 'Username is required!'
            })
        }
        if(!email) {
            res.status(400).json({
                status: 400,
                message: 'Email is required!'
            })
        }
        if(!password) {
            res.status(400).json({
                status: 400,
                message: 'Password is required!'
            })
        }

        const existingUser = await User.findOne({ email })
        if(existingUser) {
            res.status(400).json({
                status: 400,
                message: `User with email ${email} is already exists!`
            })
        }

        // Шифрование пароля
        const encryptedPassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS)

        const newUser = await User.create({ username, email, password: encryptedPassword })

        res.status(201).json({
            status: 201,
            message: `User "${newUser.username}" is created successfully!`
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            status: 500,
            message: 'Server error'
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const foundUser = await User.findOne({ email })
        if (!foundUser) {
            res.status(404).json({
                status: 404,
                message: `User with email ${email} is not found!`
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, foundUser.password)
        if(!isPasswordMatch) {
            res.status(400).json({
                status: 400,
                message: `Password does not match!`
            })
        }

        const { accessToken, refreshToken } = await generateTokens(foundUser)

        // после генерации рефреш токена сохраняем в базе
        foundUser.refreshToken = refreshToken
        await foundUser.save()

        res.status(200).json({
            status: 200,
            message: `Successful login!`,
            data: { 
                accessToken,
                refreshToken
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            status: 500,
            message: 'Server error'
        })
    }
})

router.get('/profile', verifyAccessToken, async (req, res) => { // авто-логин / получение профиля
    try {
        const user = req.user

        res.status(200).json({
            status: 200,
            message: 'User successfully found!',
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            status: 500,
            message: 'Server error'
        })
    }
})

router.put('/profile/edit', verifyAccessToken, async (req, res) => {
    try {
        const user = req.user
        const { username, email } = req.body
        
        user.username = username
        user.email = email

        await user.save()

        res.status(200).json({
            status: 200,
            message: 'User successfully edited!',
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            status: 500,
            message: 'Server error'
        })
    }
})

router.get('/refresh', verifyRefreshToken, async (req, res) => {
    try {
        const user = req.user

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user)

        user.refreshToken = newRefreshToken
        await user.save()

        res.status(200).json({
            status: 200,
            message: 'Tokens refreshed successfully!',
            data: { accessToken, refreshToken: newRefreshToken }
        });
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            status: 500,
            message: 'Server error'
        })
    }
})

export default router