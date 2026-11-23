import { db } from "../db.ts";
import bcrypt from 'bcrypt';
import { ApiError } from "../errorHandling.ts";

export async function createPlayer(username:string,password:string) {

    const hashedPassword = await bcrypt.hash(password,10)

    const text = 'INSERT INTO players (user_email, user_password) VALUES ($1, $2) RETURNING id, bankroll, user_email'
    const values = [username,hashedPassword]
    const result = await db.query(text,values)

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

export async function getPlayerUsername(username:string,password:string) {
    
    const text = 'SELECT * FROM players WHERE user_email = $1'
    const result = await db.query(text,[username])

    if (result.rows.length === 0) {
        return null
    }

    const player = result.rows[0]
    const isMatch = await bcrypt.compare(password, player.user_password);
    
    if (!isMatch) {
        delete player.user_password
        delete player.bankroll
        delete player.id
        return player
    }

    delete player.user_password
    return player
}

export async function updateBankRoll(id:string, bankroll:number, add:number, forced:boolean = false) {

    // CONCURRENCY TEST: If the player bankroll + add is not the same as the new bankroll, something has happened and we need to prevent the game from processing.
    if (!forced) {
        const newBankroll = bankroll + add

        const text_player = 'SELECT * FROM players WHERE id = $1'
        const result_player = await db.query(text_player,[id])

        if (result_player.rows.length === 0) {
            return null
        }

        const player = result_player.rows[0]

        if (player.bankroll+add !== newBankroll) {
            console.log(`Bankrolls don't match! ${player.bankroll+add} vs ${newBankroll}`)
            throw ApiError(403, 'INVALID_BANKROLL', 'Ending bankroll would led to desync.');
        }
    }

    const text = 'UPDATE players SET bankroll = $1 WHERE id = $2 RETURNING *'
    const result = await db.query(text,[bankroll+add,id])

    if (result.rows.length === 0) {
        console.log("no players found")
        return null
    }
    return result.rows[0]
}

export async function clearPlayers() {
    await db.query("TRUNCATE TABLE players CASCADE;")
}