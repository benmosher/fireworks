import { shuffle } from 'lodash'
import { makeDeck } from './deck'

/**
 * always and only the first "event"
 */
export class Shuffle {
  constructor(deck = shuffle(makeDeck())) {
    this.deck = Object.freeze(deck)
  }
}

export class Deal {
  constructor(playerCount, handCount) {
    this.playerCount = playerCount
    this.handCount = handCount
  }
}

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