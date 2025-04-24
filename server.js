import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import TestRouter from './routes/Test.js'
import AuthRouter from './routes/Auth.js'

// Чтобы работать с env файлом
dotenv.config()

// PORT
const PORT = process.env.PORT || 5000

const app = express()

// Формат ресурса - JSON
app.use(express.json())
// Настройка CORS
app.use(cors({
    origin: 'http://localhost:5173'
}))

// Чтобы использовать роутер
// TEST ROUTER
app.use('/test', TestRouter) // '/test' prefix
// AUTH ROUTER
app.use('/auth', AuthRouter)

// Подключение к MongoDB
async function connectToMongoDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Successfully connected to MongoDB!')
    }
    catch(err) {
        console.log(`Connecting to MongoDB is failed! ${err}`)
    }
}

connectToMongoDb()

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}!`)
})