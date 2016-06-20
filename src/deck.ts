import { shuffle, times } from 'lodash'
import { Map, List, Set, Seq } from 'immutable'

export const enum Color { Red, Yellow, Green, Blue, White, Multi }

export type Mode = Set<Color>

const NORMAL_MODE = Set([Color.Red, Color.Yellow, Color.Green, Color.Blue, Color.White])

export const PLAY_MODES = {
  NORMAL: NORMAL_MODE,
  MULTIS: NORMAL_MODE.add(Color.Multi)
}

export const enum Rank { One = 1, Two = 2, Three = 3, Four = 4, Five = 5 }

export class Tile {
  constructor(public color: Color, public rank: Rank) { 
    Object.freeze(this) 
  }
}

export const RANK_COUNTS = Map<Rank, number>([
  [Rank.One, 3], 
  [Rank.Two, 2],
  [Rank.Three, 2],
  [Rank.Four, 2],
  [Rank.Five, 1],
])

export function makeDeck(mode: Mode): Tile[] {
  return mode.flatMap(color => 
    RANK_COUNTS.flatMap((count, n) => 
      Seq(times(count, () => new Tile(color, n)))))
    .toArray()
}

export function shuffledDeck(mode: Mode): Tile[] {
  return shuffle(makeDeck(mode))
}