import { turn } from '../game'
import { Shuffle, Deal } from '../actions'

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

  describe("Deal", function () {
    let shuffle
    before(() => {
      shuffle = new Shuffle()
      state = turn(undefined, shuffle)
    })

    it("works for 4 players", function () {
      let deal = new Deal(4)
      let dealtState = turn(state, deal)

      expect(state).not.to.equal(dealtState)
      expect(dealtState.deck).to.have.property('length', 34)
    })
  })
})