import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from './app.js';
import { activeGames } from './store/memoryStore.ts';
import { clearPlayers, getPlayerId } from './db/playerRepo.ts';
import { clearGames, getGameId } from './db/gamesRepo.ts';
import { betCalculate, calculateTotal } from './game/engine.ts';

const fixedDeck = [
    {
        value:"QUEEN",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"ACE",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"10",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"7",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"4",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"10",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"6",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"JACK",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"ACE",
        suit:"HEARTS",
        image:"NONE"
    },
    {
        value:"8",
        suit:"HEARTS",
        image:"NONE"
    }
];

let i = 0;
const fakeDraw = (_deckId, amount) => fixedDeck.slice(i, (i += amount));
const app = createApp(fakeDraw); 

beforeEach( async () => {
    i = 0
    activeGames.clear()
    await clearGames()
    await clearPlayers()
})

test('POST games creates a game with 2 player cards and 2 dealer cards, the last dealer card is obfuscated', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:100})

  assert.equal(response.status, 201)
  assert.equal(response.body.game.playerHand.length, 2)
  assert.equal(response.body.game.dealerHand.length, 2)
  assert.equal(response.body.game.dealerHand[1].suit, "???")
});

test('POST hit adds a card to the player hand', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:100})

  const hit_response = await request(app).post(`/api/games/${response.body.game.id}/hit`)
  const get_response = await request(app).get(`/api/games/${response.body.game.id}`)

  assert.equal(response.status, 201)
  assert.equal(hit_response.status, 200)
  assert.equal(get_response.status, 200)
  assert.deepStrictEqual(get_response.body.game.playerHand[2],hit_response.body.result) // Player card 3 and the hit response should be equal
});

test('POST stand ends the game', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:100})
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  assert.ok('playerMessage' in stand_response.body.result);
});

test('POST hit after stand returns 409', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:100})
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  const hit_response = await request(app).post(`/api/games/${response.body.game.id}/hit`)

  assert.equal(hit_response.status, 409)
});

test('POST hit, stand, GET games with bad id will always return 404', async () => {
  const response = await request(app).get(`/api/games/${1}`)
  const stand_response = await request(app).post(`/api/games/${1}/stand`)
  const hit_response = await request(app).post(`/api/games/${1}/hit`)

  assert.equal(response.status, 404)
  assert.equal(stand_response.status, 404)
  assert.equal(hit_response.status, 404)
});

test('Bet larger than 1000 will lead to a status 400 and the bet will remain unchanged', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:1200})
  const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)

  assert.equal(response.status, 400)
  assert.equal('1000',player_bankroll_response.body.bankroll)
});

// TEST NO LONGER WORKS DUE TO HOW THE BANKROLL NOW FUNCTIONS
// test('Bets are removed when starting a game', async () => {
//   const player_response = await request(app).post(`/api/players`)
//   const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:200})
//   const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)

//   assert.equal(response.status, 201)
//   assert.equal('800',player_bankroll_response.body.bankroll)
// });

test('Bets are doubled on a win', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:200})
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)

  assert.equal(response.status, 201)
  assert.equal('1200',player_bankroll_response.body.bankroll)
});

test('Reload works on 0 but not 50', async () => {
  const player_response = await request(app).post(`/api/players`)
  const player_bankroll_response1 = await request(app).post(`/api/players/${player_response.body.player.id}/reload`).send({bankroll:0})
  const player_bankroll_response2 = await request(app).post(`/api/players/${player_response.body.player.id}/reload`).send({bankroll:50})

  assert.equal(player_bankroll_response1.status, 201)
  assert.equal(player_bankroll_response2.status, 409)
});

test('DB: Force end a game, ensure data is correct', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:200})
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)
  const end_response = await request(app).get(`/api/games/${response.body.game.id}`)

  const gameDatabase = await getGameId(stand_response.body.gameId)
  const playerTotal = calculateTotal(end_response.body.game.playerHand)
  const dealerTotal = calculateTotal(end_response.body.game.dealerHand)
  const payOut = betCalculate(stand_response.body.result.winState,end_response.body.game.bet)

  assert.ok('playerMessage' in stand_response.body.result);
  assert.equal(gameDatabase.id, stand_response.body.gameId)
  assert.equal(gameDatabase.player_id, player_response.body.player.id)
  assert.equal(gameDatabase.bet, end_response.body.game.bet)
  assert.equal(gameDatabase.outcome, stand_response.body.result.winState)
  assert.equal(gameDatabase.payout, payOut)
  assert.equal(gameDatabase.bankroll_after, Number(player_bankroll_response.body.bankroll))
  assert.equal(gameDatabase.player_total, playerTotal)
  assert.equal(gameDatabase.dealer_total, dealerTotal)
});

test('DB: Ensure player data is correct', async () => {
  const player_response = await request(app).post(`/api/players`)

  const playerDatabase = await getPlayerId(player_response.body.player.id)

  assert.equal(player_response.status, 201)
  assert.equal(player_response.body.player.id, playerDatabase.id)
  assert.equal(player_response.body.player.bankroll, playerDatabase.bankroll)
});

test('DB: Bankroll updates correctly', async () => {
  const player_response = await request(app).post(`/api/players`)

  const prePlayerDatabase = await getPlayerId(player_response.body.player.id)

  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:200})
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)

  const postPlayerDatabase = await getPlayerId(player_response.body.player.id)

  assert.equal(response.status, 201)
  assert.equal(1000,prePlayerDatabase.bankroll)
  assert.equal(1200,postPlayerDatabase.bankroll)
});