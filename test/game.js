import { turn, currentHand, isPlayable } from '../game'
import { first } from '../proto'
import { Shuffle, Deal, Play, Clue } from '../actions'

import { expect } from 'chai'

describe("game redux", function () {
  describe("Shuffle", function () {
    let state
    before(() => state = undefined)
    it("creates a state and assigns the deck", function () {
      let shuffle = new Shuffle()
      state = turn(state, shuffle)

      expect(state.deck).to.equal(shuffle.deck)
    })
  })

  describe("Deal", function () {
    let shuffle, deal, states
    describe("four players", function () {
      before(() => {
        states = []

        shuffle = new Shuffle()
        states.push(turn(undefined, shuffle))
        
        deal = new Deal(4)
        states.push(turn(states[0], deal))
      })

      it("produced a new game state", function () {
        expect(states[1]).not.to.equal(states[0])
      })

      it("consumed first 16 tiles from deck", function () {
        expect(states[1].deck).to.have.property('length', 34)
        // popped last 16
        expect(states[0].deck.slice(0, 50 - 16)).to.deep.equal(states[1].deck)
      })

      it("has four hands", function () {
        // expect(state).not.to.equal(dealtState)
        expect(states[1].hands.length).to.equal(deal.playerCount)
      })

      it("has 4 tiles per hand", function () {
        for (let hand of states[1].hands) {
          expect(hand.size).to.equal(4)
        }
      })
    })
    describe("three players", function () {
      before(() => {
        states = []

        shuffle = new Shuffle()
        states.push(turn(undefined, shuffle))
        
        deal = new Deal(3)
        states.push(turn(states[0], deal))
      })

      it("produced a new game state", function () {
        expect(states[1]).not.to.equal(states[0])
      })

      it("is on turn 0", function () {
        expect(states[1]).to.have.property('turn', 0)
      })

      it("consumed first 15 tiles from deck", function () {
        expect(states[1].deck).to.have.property('length', 35)
        // popped last 15
        expect(states[0].deck.slice(0, 50 - 15)).to.deep.equal(states[1].deck)
      })

      it("has three hands", function () {
        // expect(state).not.to.equal(dealtState)
        expect(states[1].hands.length).to.equal(deal.playerCount)
      })

      it("has 5 tiles per hand", function () {
        for (let hand of states[1].hands) {
          expect(hand.size).to.equal(5)
        }
      })
    })
  })

  describe("Play", function () {
    let actions, states, play
    before(() => {
      actions = []

      actions.push(new Shuffle())
      actions.push(new Deal(4))
      
      states = [actions.reduce(turn, undefined)]
      let tile = first(currentHand(states[0]))
      play = new Play(tile)
      states.push(turn(states[0], new Play(tile)))
    })

    it("was played correctly", function () {
      if (isPlayable(states[0], play.tile)) {
        expect(states[1].discards.has(play.tile)).to.be.false
      } else {
        expect(states[1].discards.has(play.tile)).to.be.true
      }
    })

    it("didn't fry the hands", function () {
      expect(states[1].hands.length).to.equal(4)
      for (let hand of states[1].hands) {
        expect(hand).to.exist
      }
    })

    it("increments the turn indicator", function () {
      expect(states[1].turn).to.equal(1)
    })

    it("still has a currentHand", function () {
      expect(currentHand(states[1])).to.exist
    })
  })

  describe("Play", function () {
    let actions, states, play
    before(() => {
      actions = []

      actions.push(new Shuffle())
      actions.push(new Deal(2))
      
      states = [actions.reduce(turn, undefined)]
      let tile = first(currentHand(states[0]))
      play = new Play(tile)
      states.push(turn(states[0], play))

      // second play
      tile = first(currentHand(states[1]))
      play = new Play(tile)
      states.push(turn(states[1], play))
    })

    it("was played correctly", function () {
      if (isPlayable(states[1], play.tile)) {
        expect(states[2].discards.has(play.tile)).to.be.false
      } else {
        expect(states[2].discards.has(play.tile)).to.be.true
      }
    })

    it("didn't fry the hands", function () {
      for (let hand of states[2].hands) {
        expect(hand).to.exist
      }
    })

    it("increments the turn indicator", function () {
      expect(states[2].turn).to.equal(0)
    })
  })

  describe("Clue", function () {
    let actions, states, tile, clue
    before(() => {
      actions = []

      actions.push(new Shuffle())
      actions.push(new Deal(2))
      
      states = [actions.reduce(turn, undefined)]
      tile = first(states[0].hands[1])
      clue = new Clue(1, { color: tile.color })
      states.push(turn(states[0], clue))
    })

    it("burned a clue", function () {
      expect(states[1].clues).to.equal(7)
    })

    it("added color knowledge", function () {
      expect(states[1].knowledge.get(tile)).to.deep.equal({ color: tile.color })
    })

    it("increments the turn indicator", function () {
      expect(states[1].turn).to.equal(1)
    })
  })
})