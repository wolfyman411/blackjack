// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {mount} from "@vue/test-utils"
import BetControls from "./BetControls.vue";

describe('BetControls.vue', () => {
    it('button disabled when round is in progress', async () => {
        const wrapper = mount(BetControls, {
            props: {
                playerMoney: 1000,
                playerBet: 0,
                disableBet: true,
                playerMessage: ''
            }
        })

        const buttons = wrapper.findAll('button')

        buttons.forEach(button => {
            expect(button.attributes('disabled')).toBeDefined()
        })
    })
})