const colorText = require('colors/safe')

import { deck, dealer, colors } from './deck'
import { times } from 'lodash'

const HAND_COUNT = 4
    , CLUE_MAX = 8
    , FUSE_MAX = 4

export class Game {
  // constructor sets up initial game state
  constructor(playerCount) {
    this.deck = deck()
    this.deal = dealer(this.deck)

    this.hands = times(playerCount, () => [])

    this.discards = []
    this.played = {}

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
  }

  isPlayable(tile) {
    return this.played[tile.color] === tile.number - 1
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