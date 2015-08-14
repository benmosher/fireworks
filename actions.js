import { shuffledDeck } from './deck'

/**
 * always and only the first "event"
 */
export class Shuffle {
  constructor(deck = shuffledDeck()) {
    this.deck = Object.freeze(deck)
  }
}

export class Deal {
  constructor(playerCount) {
    this.playerCount = playerCount
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
  constructor(player, info) {
    this.player = player
    this.info = info
  }
}