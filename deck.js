import { shuffle } from 'lodash'

export const colors = new Set(['red', 'yellow', 'green', 'blue', 'white'])

export const numbers = [1, 2, 3, 4, 5]
           , counts =  [3, 2, 2, 2, 1]

           , DECK_LENGTH = 50 // sum(counts) * colors.length

export function makeDeck() {
  const deck = []
  
  for (let color of colors) {
    for (let number of numbers) {
      for (let c = 0; c < counts[number - 1]; c++) {
        deck.push(Object.freeze({ color, number }))
      }
    }
  }

  return Object.freeze(deck)
}

export function shuffledDeck() {
  return Object.freeze(shuffle(makeDeck()))
}