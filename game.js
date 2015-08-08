const colorText = require('colors/safe')

import { makeDeck, colors } from './deck'
import { times, shuffle } from 'lodash'

const HAND_COUNT = 4
    , CLUE_MAX = 8
    , FUSE_MAX = 4

export class GameState {
  // constructor sets up initial game state
  constructor() {
    this.deck = null
    this.hands = []

    this.discards = []
    this.played = {}

    this.clues = CLUE_MAX
    this.fuses = FUSE_MAX

    // set up board
    for (let color of colors) {
      this.played[color] = 0
    }

    this.turn = 0
  }

  isPlayable(tile) {
    return this.played[tile.color] === tile.number - 1
  }

  get currentHand() { return this.hands[this.turn] }

  isOver() {
    return this.fuses === 0 || this.hands[this.turn].length === 0
  }
}

class GameOver extends Error {}
class InvalidPlay extends Error {}

import { Shuffle, Deal, Play, Discard, Clue } from './actions'
import protoAssign from './proto-assign'

function turn(state = new GameState(), action) {

  if (state.isOver()) 
    throw new InvalidPlay("game has ended")

  if (action instanceof Shuffle) {
    return shuffle(state, action)
  }

  if (action instanceof Deal) {
    return deal(state, action)
  }

  const { tile } = action

  if (action instanceof Play) {
    return play(state, action)
  }

  if (action instanceof Discard) {

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

function shuffle(state, action) {
  if (state.deck != null) throw new InvalidPlay('deck exists')
  return protoAssign(state, { deck: action.deck })
}

function deal(state, action) {
  if (state.deck == null || state.deck.length != DECK_LENGTH)
    throw new InvalidPlay('deck is not fresh')
  if (!isEmpty(state.hands)) 
    throw new InvalidPlay('hands are dealt')

  let deck = state.deck.slice()
    , hands = []
  let handCount = action.playerCount <= 3 ? 5 : 4
  for (let i = 0; i < playerCount; i++) {
    let hand = new Set(); hands.push(hand)
    for (let j = 0; j < handCount; j++) {
      hand.add(deck.pop())
    }
    Object.freeze(hand)
  }

  Object.freeze(deck)
  Object.freeze(hands)

  return protoAssign(state, { hands, deck })
}

function play(state, action) {
  const { tile } = action

  if (!state.currentHand.has(tile))
    throw new InvalidPlay("must play tiles from hand")


  if (!state.isPlayable(tile)) {
    const discards = state.discards.concat(tile)
        , fuses = state.fuses - 1
        , hand = new Set(state.currentHand)
        , hands = state.hands.slice()
        , [draw, ...deck] = state.deck

    hand.delete(tile)
    hand.add(draw)

    hands.splice(state.turn, 1, hand)

    return protoAssign(state, { discards, fuses })
  }
    // } else {
    //   this.played.tiles.push(tile)

    //   this.played[tile.color] = tile.number

    //   // get a clue back for 5s
    //   if (tile.number === 5) {
    //     this.clues = Math.max(this.clues + 1, CLUE_MAX)
    //   }
    // }
    // this.draw()
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