const _ = require('lodash')

export const colors = ['red', 'yellow', 'green', 'blue', 'white']

export const numbers = [1, 2, 3, 4, 5]
           , counts =  [3, 2, 2, 2, 1]

export function deck() {
  const deck = []
  
  for (let color of colors) {
    for (let number of numbers) {
      for (let c = 0; c < counts[number - 1]; c++) {
        deck.push({color, number})
      }
    }
  }

  return deck
}

export function dealer(deck) {
  // the game starts here
  let permutation = _.shuffle(_.range(deck.length))

  return function deal() {
    return deck[permutation.pop()]
  }
}