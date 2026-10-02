import {describe, expect, test} from 'vitest'
import type { Card } from './types'
import { calculateTotal, canPlaceBet, checkWinState, dealerShouldDraw } from './gameLogic'

describe('Deck score testing',() => {
    test("KING + 5 = 15", () => {
            var testCard1:Card = {
            value:"KING",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testCard2:Card = {
            value:"5",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testHand:Card[] = [testCard1,testCard2]
        expect(calculateTotal(testHand)).toBe(15)
    })
    test("ACE + 9 = 20", () => {
            var testCard1:Card = {
            value:"ACE",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testCard2:Card = {
            value:"9",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testHand:Card[] = [testCard1,testCard2]
        expect(calculateTotal(testHand)).toBe(20)
    })
    test("ACE + ACE = 12", () => {
            var testCard1:Card = {
            value:"ACE",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testCard2:Card = {
            value:"ACE",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testHand:Card[] = [testCard1,testCard2]
        expect(calculateTotal(testHand)).toBe(12)
    })
    test("ACE + 9 + 5 = 15", () => {
            var testCard1:Card = {
            value:"ACE",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testCard2:Card = {
            value:"9",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testCard3:Card = {
            value:"5",
            suit:"Hearts",
            image:"",
            hidden:false
        }
        var testHand:Card[] = [testCard1,testCard2,testCard3]
        expect(calculateTotal(testHand)).toBe(15)
    })
})

describe('Bust testing',() => {
    test("22 Busts", () => {
        expect(checkWinState(1,22,0).winState).toBe(0)
    })
})

describe('Draw testing',() => {
    test("Dealer draws on 16", () => {
        expect(dealerShouldDraw(16)).toBe(true)
    })
    test("Dealer doesn't draw on 17", () => {
        expect(dealerShouldDraw(17)).toBe(false)
    })
})

describe('Bet placing',() => {
    test("1000 Bank, we bet 500", () => {
        expect(canPlaceBet(1000,0,500)).toBe(true)
    })
    test("50 Bank, we can't bet 500", () => {
        expect(canPlaceBet(50,0,500)).toBe(false)
    })
    test("500 Bank, 500 Bet, we widthdraw 500", () => {
        expect(canPlaceBet(500,500,-500)).toBe(true)
    })
    test("500 Bank, 0 Bet, we can't widthdraw 500", () => {
        expect(canPlaceBet(500,0,-500)).toBe(false)
    })
})

describe('Ending cases',() => {
    test("Draw", () => {
        expect(checkWinState(17,17,0).winState).toBe(2)
    })
    test("Player Higher", () => {
        expect(checkWinState(1,21,0).winState).toBe(1)
    })
    test("Dealer Higher", () => {
        expect(checkWinState(21,1,0).winState).toBe(0)
    })
    test("Player Bust", () => {
        expect(checkWinState(1,22,0).winState).toBe(0)
    })
    test("Dealer Bust", () => {
        expect(checkWinState(22,1,0).winState).toBe(1)
    })
})