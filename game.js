import { isEmpty } from 'lodash'

import { DECK_LENGTH, colors } from './deck'

const CLUE_MAX = 8
    , FUSE_MAX = 4

// game starting state objects
const INITIAL_PLAYED = Object.freeze(
  Object.assign({}, ...colors.map(c => ({ [c]: 0 }))))

const INITIAL_STATE = Object.freeze({
  deck: null,
  hands: [],

  played: INITIAL_PLAYED,
  discards: new Set(),
  
  knowledge: new Map(),

  clues: CLUE_MAX,
  fuses: FUSE_MAX,

  turn: 0
})

class InvalidPlay extends Error {}

import { Shuffle, Deal, Play, Discard, Clue } from './actions'
import { assign, splice, add, merge, some } from './proto'

export function turn(state = INITIAL_STATE, action) {
  if (action instanceof Shuffle) {
    return shuffle(state, action)
  }

  if (state == null) throw new InvalidPlay("need state for non-shuffle actions")

  if (action instanceof Deal) {
    return deal(state, action)
  }

  if (isGameOver(state)) 
    throw new InvalidPlay("game has ended")

  if (action instanceof Play) {
    return play(state, action)
  }

  if (action instanceof Discard) {
    return discard(state, action)
  }

  if (action instanceof Clue) {
    return clue(state, action)
  }
}

function nextTurn(state) {
  // on to the next player
  return { turn: (state.turn + 1) % state.hands.length }
}

function shuffle(state, action) {
  if (state.deck != null) throw new InvalidPlay('deck exists')

  if (action.deck == null || action.deck.length != 50) 
    throw new InvalidPlay("invalid deck")

  return assign(state, { deck: action.deck })
}

function deal(state, action) {
  if (state.deck == null || state.deck.length != DECK_LENGTH)
    throw new InvalidPlay('deck is not fresh')
  if (!isEmpty(state.hands)) 
    throw new InvalidPlay('hands are dealt')

  let deck = state.deck.slice()
    , hands = []
  let handCount = action.playerCount <= 3 ? 5 : 4
  for (let i = 0; i < action.playerCount; i++) {
    let hand = new Set(); hands.push(hand)
    for (let j = 0; j < handCount; j++) {
      hand.add(deck.pop())
    }
    Object.freeze(hand)
  }

  Object.freeze(deck)
  Object.freeze(hands)

  return assign(state, { hands, deck })
}

function removeAndDraw(state, tile) {
  const hand = new Set(currentHand(state))
      , hands = splice(state.hands, state.turn, 1, hand)
      , [drawn, ...deck] = state.deck

  hand.delete(tile)
  hand.add(drawn)

  return { hand, hands, deck }
}

function play(state, action) {
  const { tile } = action

  if (!currentHand(state).has(tile))
    throw new InvalidPlay("must play tiles from hand")


  if (isPlayable(state, tile)) {
    const played = assign(state.played, { [tile.color]: [tile.number] })
        , clues = tile.number === 5 ? Math.max(state.clues + 1, CLUE_MAX) 
                                    : state.clues

    return assign( state
                 , { played, clues }
                 , removeAndDraw(state, tile)
                 , nextTurn(state)
                 )
  } else {
    const discards = state.discards.concat(tile)
        , fuses = state.fuses - 1

    return assign( state
                 , { discards, fuses }
                 , removeAndDraw(state, tile)
                 , nextTurn(state)
                 )
  }
}

function currentHand(state) { return state.hands[state.turn] }

function isPlayable(state, tile) {
  return state.played[tile.color] === tile.number - 1
}

function discard(state, action) {
  const { tile } = action.tile

  if (!currentHand(state).has(tile)) 
    throw new InvalidPlay("can't discard what you don't have")

  const discards = add(state.discards, tile)
      , clues = Math.max(state.clues + 1, CLUE_MAX)

  return assign( state
               , { discards, clues }
               , removeAndDraw(state, tile)
               , nextTurn(state)
               )
}

function isGameOver(state) {
  return state.fuses === 0 || currentHand(state).length !==
    (state.hands.length <= 3 ? 5 : 4)
}


function clue(state, action) {
  if (state.clues <= 0)
    throw new InvalidPlay("no clues to give")

  const { tiles, clue, player } = action

  if (some(state.currentHand, tile => tiles.has(tile))) 
    throw new InvalidPlay("no self-clues")

  if (some( state.hands[player]
          , tile => !tiles.has(tile) && matches(tile, clue)))
    throw new InvalidPlay("must provide all matching tiles")

  const clues = state.clues - 1
      , knowledge = merge(state.knowledge, tiles.map(tile => [tile, clue]))

  return assign(state, { clues, knowledge }, nextTurn(state))
}

function matches(tile, clue) {
  return tile.color === clue.color || tile.number === clue.number
}
