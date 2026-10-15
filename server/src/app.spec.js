import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { createApp } from './app.js';
import { activeGames } from './store/memoryStore.ts';

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

beforeEach(() => {
    i = 0
    activeGames.clear();
})

test('POST games creates a game with 2 player cards and 2 dealer cards, the last dealer card is obfuscated', async () => {
  const response = await request(app).post('/api/games')

  assert.equal(response.status, 201)
  assert.equal(response.body.game.playerHand.length, 2)
  assert.equal(response.body.game.dealerHand.length, 2)
  assert.equal(response.body.game.dealerHand[1].suit, "???")
});

test('POST hit adds a card to the player hand', async () => {
  const response = await request(app).post('/api/games')

  const hit_response = await request(app).post(`/api/games/${response.body.game.id}/hit`)
  const get_response = await request(app).get(`/api/games/${response.body.game.id}`)

  assert.equal(response.status, 201)
  assert.equal(hit_response.status, 200)
  assert.equal(get_response.status, 200)
  assert.deepStrictEqual(get_response.body.game.playerHand[2],hit_response.body.result) // Player card 3 and the hit response should be equal
});

test('POST stand ends the game', async () => {
  const response = await request(app).post('/api/games')
  const stand_response = await request(app).post(`/api/games/${response.body.game.id}/stand`)
  assert.ok('playerMessage' in stand_response.body.result);
});

test('POST hit after stand returns 409', async () => {
  const response = await request(app).post('/api/games')
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

test('Bets are removed when starting a game', async () => {
  const player_response = await request(app).post(`/api/players`)
  const response = await request(app).post('/api/games').send({playerId:player_response.body.player.id,bet:200})
  const player_bankroll_response = await request(app).get(`/api/players/${player_response.body.player.id}`)

  assert.equal(response.status, 201)
  assert.equal('800',player_bankroll_response.body.bankroll)
});

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