import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        // Olzhas2003@gmail.com -> olzhas2003@gmail.com
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
