import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
    res.json({
        response: 'Testing route!'
    })
})

router.get('/hello', async (req, res) => {
    res.json({
        response: 'Hello developer!'
    })
})

export default router