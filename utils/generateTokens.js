import jwt from 'jsonwebtoken'

export default async function generateTokens(user) {
        const accessToken = await jwt.sign(
            {...user},
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        const refreshToken = await jwt.sign(
            {...user},
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        )

        return { accessToken, refreshToken }
}