import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

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

        const accessToken = await jwt.sign(
            {...foundUser},
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        )

        res.status(200).json({
            status: 200,
            message: `Successful login!`,
            data: { 
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                accessToken
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

router.get('/profile', (req, res) => { // авто-логин
    try {
        const authorization = req.headers.authorization

        if(!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token is not provided!' });
        }

        const token = authorization.split(' ')[1] // ['Bearer', 'token']
        const decodedUser = jwt.decode(token, process.env.JWT_SECRET)
        delete decodedUser.password

        res.status(200).json({
            status: 200,
            message: 'User successfully found!',
            data: decodedUser
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

export default router