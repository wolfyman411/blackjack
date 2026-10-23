import { db } from "../db.ts";

export async function createPlayer() {
    const text = 'INSERT INTO players DEFAULT VALUES RETURNING id, bankroll'
    const result = await db.query(text)

    return result.rows[0]
}

export async function getPlayerId(id:string) {
    const text = 'SELECT * FROM players WHERE id = $1'
    const result = await db.query(text,[id])

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0]
}

export async function updateBankRoll(id:string, newBankroll:number) {
    const text = 'UPDATE players SET bankroll = $1 WHERE id = $2'
    const result = await db.query(text,[newBankroll,id])

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0]
}

export async function clearPlayers() {
    await db.query("TRUNCATE TABLE players CASCADE;")
}