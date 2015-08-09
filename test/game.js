import { turn } from '../game'
import { Shuffle } from '../actions'

import { expect } from 'chai'

describe("game redux", function () {
  let state
  describe("Shuffle", function () {
    before(() => state = undefined)
    it("creates a state and assigns the deck", function () {
      let shuffle = new Shuffle()
      state = turn(state, shuffle)

      expect(state.deck).to.equal(shuffle.deck)
    })
  })
})