import express from 'express';

export function appRouter() {
    const router = express.Router();

    router.get('/health', async function(req, res) {
        res.status(200).json({
            "ok": true
        })
    })

    return router
}