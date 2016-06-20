import { isEmpty, times, extend } from 'lodash'
import { Map, List, OrderedSet, Set, Record } from 'immutable'
import invariant = require('invariant')

function shallowEquals<T>(a: T, b: T) {
  if (a === b) return true
  for (let key in a) {
    if (a[key] !== b[key]) return false
  }
  return true
}

import { Tile, Color, Rank, Mode, PLAY_MODES, shuffledDeck } from './deck'

type Clue = Rank | Color

const CLUE_MAX = 8
    , FUSE_MAX = 3

type Hand = OrderedSet<Tile>

class Knowledge {
  public positive: Map<Tile, Clue>
  public negative: Map<Tile, Set<Clue>>
  
  static blank() {
    const k = new Knowledge()

    k.positive = Map<Tile, Clue>()
    k.negative = Map<Tile, Set<Clue>>()
    
    return Object.freeze(k)
  }

  forget(tile: Tile) {
    const next = new Knowledge()
    
    next.positive = this.positive.remove(tile)
    next.negative = this.negative.remove(tile)

    if (shallowEquals(this, next)) return this

    return Object.freeze(next)
  }

}

class Player {
  public hand: Hand
  public knowledge: Knowledge
  
  static deal(hand: Hand) {
    const player = new Player()
    player.hand = hand
    player.knowledge = Knowledge.blank()
    
    return Object.freeze(player)
  }

  removeAndDraw(play: Tile, draw: Tile) {
    invariant(this.hand.contains(play), "player does not have tile")

    const next = new Player()

    next.hand = this.hand.withMutations(h => {
      h.remove(play)
      if (draw !== null) h.add(draw)    
    })
    next.knowledge = this.knowledge.forget(play)

    return Object.freeze(next)
  }
}

class TileTurn {
  constructor(public tile: Tile) { Object.freeze(this) }
}

class PlayTurn extends TileTurn {}
class DiscardTurn extends TileTurn {}
class ClueTurn {
  constructor(public recipient: Player, public clue: Clue) { Object.freeze(this) }
}

type Turn = PlayTurn | DiscardTurn | ClueTurn

class GameState {
  public deck: List<Tile>
  public players: List<Player>
  
  // highest rank played
  public played: Map<Color, Rank>
  public discards: Set<Tile>

  public clues: number
  public fuses: number

  public turns: List<Turn>

  static shuffleAndDeal(
    mode: Mode,
    playerCount: number
  ) {
    const game = new GameState()
    
    const deck = shuffledDeck(mode)
    const mutableHands: Tile[][] = times(playerCount, () => [])

    for (let tiles = playerCount <= 3 ? 5 : 4; tiles > 0; tiles--) {
      mutableHands.forEach(hand => hand.push(deck.pop()))
    }

    game.deck = List(deck)
    game.players = List(mutableHands.map(h => Player.deal(OrderedSet(h))))

    game.played = Map<Color, Rank>()
    game.discards = Set<Tile>()
    game.clues = CLUE_MAX
    game.fuses = FUSE_MAX

    game.turns = List<Turn>()

    return Object.freeze(game)
  }

  get currentPlayerIndex() {
    return this.turns.size % this.players.size
  }

  get currentPlayer() {
    return this.players.get(this.currentPlayerIndex)
  }

  set currentPlayer(p: Player) {
    this.players = this.players.set(this.currentPlayerIndex, p)
  }
  
  get isComplete() {
    return this.fuses === 0 || this.currentPlayer.hand.size <
      (this.players.size <= 3 ? 5 : 4)
  }

  isPlayable(tile: Tile) {
    return this.played.get(tile.color) === tile.rank - 1
  }
  
  takeTurn(turn: Turn, mutator: (g: GameState) => void) {
    // clone
    const next = Object.assign(new GameState(), this)
    
    mutator(next)
    
    invariant(next.turns === this.turns, "mutator must not modify turns itself")
    next.turns = this.turns.push(turn)
    
    return Object.freeze(next)
  }

  deal(tile: Tile) {
    invariant(!Object.isFrozen(this), "can only deal durning takeTurn callback")
    
    const drawTile = this.deck.last() || null
    
    if (drawTile !== null) this.deck = this.deck.pop()
    this.currentPlayer = this.currentPlayer.removeAndDraw(tile, drawTile)
  }
}

export function turn(game: GameState, action: Turn) {
  invariant(game != null, "it is illogical to execute a turn without a game")
  invariant(!game.isComplete, "game has ended")

  if (action instanceof PlayTurn) {
    return play(game, action)
  }

  if (action instanceof DiscardTurn) {
    return discard(game, action)
  }

  if (action instanceof ClueTurn) {
    return clue(game, action)
  }
}

function play(game: GameState, turn: PlayTurn): GameState {
  return game.takeTurn(turn, g => {
  
    // attempt play
    if (game.isPlayable(turn.tile)) {
      g.played = game.played.set(turn.tile.color, turn.tile.rank)
      if (turn.tile.rank === Rank.Five && g.clues < CLUE_MAX) {
        g.clues += 1
      }
    } else {
      // fail. throw it away
      g.discards = game.discards.add(turn.tile)
      g.fuses -= 1
    }
    
    // draw either way
    game.deal(turn.tile)
  })
}

function discard(game: GameState, turn: DiscardTurn) {
  return game.takeTurn(turn, g => {
    g.discards.add(turn.tile)
    g.deal(turn.tile)
  })
}

function clue(state, action) {
  if (state.clues <= 0)
    throw new Error("no clues to give")

  const { info, player } = action

  if (state.turn === player) 
    throw new Error("no self-clues")

  if (!some( state.hands[player]
           , tile => matches(tile, info)))
    throw new Error("player must have some of this")

  const clueTiles = filter(state.hands[player], tile => matches(tile, info))

  const clues = state.clues - 1
      , knowledge = new Map(state.knowledge)

  for (let tile of clueTiles) {
    knowledge.set(tile, Object.assign({}, knowledge.get(tile), info))
  }

  return assign(state, { clues, knowledge }, nextTurn(state))
}

function matches(tile, clue) {
  return tile.color === clue.color || tile.number === clue.number
}
