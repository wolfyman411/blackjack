import { db } from "../db.ts";

export async function createGame(player_id:string,bet:number,outcome:string,payout:number,bankroll_after:number,player_total:number,dealer_total:number) {
    const text = "INSERT INTO games (player_id,bet,outcome,payout,bankroll_after,player_total,dealer_total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    const result = await db.query(text,[player_id,bet,outcome,payout,bankroll_after,player_total,dealer_total])

    return result.rows[0]
}