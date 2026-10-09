import { test } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import { app } from './app.js'

test('POST games creates a game with 2 player cards and 2 dealer cards, the last dealer card is obfuscated', async () => {
  const response = await request(app).post('/api/games')

  assert.equal(response.status, 201)
  assert.equal(response.body.game.playerHand.length, 2)
  assert.equal(response.body.game.dealerHand.length, 2)
  assert.equal(response.body.game.dealerHand[1].suit, "???")
});

test('POST hit adds a card to the player hand', async () => {
  const response = await request(app).post('/api/games')

  const hit_response = await request(app).post(`/api/games/${response.body.game.deck_id}/hit`)
  const get_response = await request(app).get(`/api/games/${response.body.game.id}`)

  assert.equal(response.status, 201)
  assert.equal(hit_response.status, 200)
  assert.equal(get_response.status, 200)
  assert.deepStrictEqual(get_response.body.game.playerHand[2],hit_response.body.result) // Player card 3 and the hit response should be equal
});

test('POST stand ends the game', async () => {
  const response = await request(app).post('/api/games')
  const stand_response = await request(app).post(`/api/games/${response.body.game.deck_id}/stand`)
  assert.ok('playerMessage' in stand_response.body.result);
});

test('POST hit after stand returns 409', async () => {
  const response = await request(app).post('/api/games')
  const stand_response = await request(app).post(`/api/games/${response.body.game.deck_id}/stand`)
  const hit_response = await request(app).post(`/api/games/${response.body.game.deck_id}/hit`)

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