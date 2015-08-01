"use strict"

const _ = require('lodash')

const colors = ['red', 'yellow', 'green', 'blue', 'white']

const numbers = [1, 2, 3, 4, 5]
    , counts =  [3, 2, 2, 2, 1]

let deck = []
for (let color of colors) {
  for (let number of numbers) {
    for (let c = 0; c < counts[number - 1]; c++) {
      deck.push({color, number})
    }
  }
}

// the game starts here
let permutation = _.shuffle(_.range(deck.length))

function deal() {
  return deck[permutation.pop()]
}

let hands = [[], [], [], []]
  , discards = []
  , played = []

for (let i = 0; i < 4; i++) {
  for (let hand of hands) {
    hand.push(deal())
  }
}

const MAX_CLUES = 8
let clues = 8
  , fuses = 4

let player = 0

function printState() {
  console.log(`you are player ${player}.`)
  console.log(`there are ${clues} clues and ${fuses} fuses.`)

  hands.forEach(function (hand, playerIndex) {
    if (playerIndex === player) return
    printPlayer(playerIndex, hand)
  })

  console.log(`discards are: ${handString(discards)}`)
  console.log(`played are: ${handString(played)}`)
}

function printPlayer(player, hand) {
  console.log(`player ${player} has ${handString(hand)}.`)
}

function handString(hand) {
  return hand.map(function (h) { return `${h.color} ${h.number}`}).join(', \t')
}

printState()
