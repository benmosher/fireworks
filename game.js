const colorText = require('colors/safe')

import { deck, dealer, colors } from './deck'
import { times } from 'lodash'

const HAND_COUNT = 4
    , CLUE_MAX = 8
    , FUSE_MAX = 4

export class GameState {
  // constructor sets up initial game state
  constructor(playerCount) {
    this.deck = deck()
    this.deal = dealer(this.deck)

    this.hands = times(playerCount, () => [])

    this.discards = []
    this.played = {tiles:[]}

    this.clues = CLUE_MAX
    this.fuses = FUSE_MAX

    // deal
    for (let i = 0; i < HAND_COUNT; i++) {
      for (let hand of this.hands) {
        hand.push(this.deal())
      }
    }

    // set up board
    for (let color of colors) {
      this.played[color] = 0
    }

    this.turn = 0
  }

  isPlayable(tile) {
    return this.played[tile.color] === tile.number - 1
  }

  draw() {
    let next = this.deal()
    // check for out of tiles
    if (next) {
      this.hands[this.turn].push(next)
    }
  }

  takeTile(tile) {
    if (!includes(this.hands[this.turn], tile)) {
      throw new InvalidPlay()
    }

    this.hands[this.turn] = without(this.hands[this.turn], tile)
  }

  isOver() {
    return this.fuses === 0 || this.hands[this.turn].length === 0
  }

  update(action) {

    const { tile } = action

    if (action instanceof Play) {
      
      this.takeTile(tile)

      if (!this.isPlayable(tile)) {
        this.discards.push(tile)
      } else {
        this.played.tiles.push(tile)

        this.played[tile.color] = tile.number

        // get a clue back for 5s
        if (tile.number === 5) {
          this.clues = Math.max(this.clues + 1, CLUE_MAX)
        }
      }
      this.draw()
      
    } else if (action instanceof Discard) {

      this.takeTile(tile)
      this.discards.push(tile)
      this.clues = Math.max(this.clues + 1, CLUE_MAX)
      this.draw()

    } else if (action instanceof Clue) {
      
      if (this.clues <= 0) throw new InvalidPlay()
      this.clues -= 1
      
    }
  
    // on to the next player
    this.turn = (this.turn + 1) % this.hands.length
  }
}

class GameOver extends Error {}
class InvalidPlay extends Error {}

export class Play {
  constructor(tile) {
    this.tile = tile
  }
}

export class Discard {
  constructor(tile) {
    this.tile = tile
  }
}

export class Clue {
  constructor(player, indexes, info) {
    this.player = player
    this.indexes = indexes
    this.info = info
  }
}

export function writeView(stream, game, player) {
  stream.write(`you are player ${player}.\n`)
  stream.write(`there are ${game.clues} clues and ${game.fuses} fuses.\n`)

  game.hands.forEach(function (hand, playerIndex) {
    if (playerIndex === player) return
    writePlayer(stream, playerIndex, hand)
  })

  stream.write(`discards are: ${handString(game.discards)}\n`)
  stream.write(`played are: ${boardString(game.played)}\n`)
}

export function writePlayer(stream, player, hand) {
  stream.write(`player ${player} has ${handString(hand)}.\n`)
}

function handString(hand) {
  return hand.map(h => 
    colorText[h.color](`${h.color} ${h.number}`)).join(', \t')
}

function boardString(board) {
  return JSON.stringify(board) // for now
}