import { db } from "../db.ts";

export async function createGame(player_id:string,bet:number,outcome:string,payout:number,bankroll_after:number,player_total:number,dealer_total:number) {
    const text = "INSERT INTO games (player_id,bet,outcome,payout,bankroll_after,player_total,dealer_total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    const result = await db.query(text,[player_id,bet,outcome,payout,bankroll_after,player_total,dealer_total])

    return result.rows[0]
}

export async function getGameId(id:string) {
    const text = 'SELECT * FROM games WHERE id = $1'
    const result = await db.query(text,[id])

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0]
}

export async function clearGames() {
    await db.query("TRUNCATE TABLE games;")
}