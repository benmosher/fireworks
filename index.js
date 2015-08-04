"use strict"

const _ = require('lodash')
const readline = require('readline')
const colorText = require('colors/safe')

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
  , played = {}

// deal
for (let i = 0; i < 4; i++) {
  for (let hand of hands) {
    hand.push(deal())
  }
}

// set up board
for (let color of colors) {
  played[color] = 0
}

const MAX_CLUES = 8
let clues = 8
  , fuses = 4

let player = 0

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.setPrompt('>')

function printState() {
  rl.output.write(`you are player ${player}.\n`)
  rl.output.write(`there are ${clues} clues and ${fuses} fuses.\n`)

  hands.forEach(function (hand, playerIndex) {
    if (playerIndex === player) return
    printPlayer(playerIndex, hand)
  })

  rl.output.write(`discards are: ${handString(discards)}\n`)
  rl.output.write(`played are: ${boardString(played)}\n`)
}

function printPlayer(player, hand) {
  rl.output.write(`player ${player} has ${handString(hand)}.\n`)
}

function handString(hand) {
  return hand.map(function (h) { return colorText[h.color](`${h.color} ${h.number}`)}).join(', \t')
}

function boardString(board) {
  return JSON.stringify(board) // for now
}

function isPlayable(tile, board) {
  return board[tile.color] === tile.number - 1
}

// repl

rl.output.write("let's play.\n")
rl.prompt()

rl.on('line', function (line) {
  console.log('entered line')
  printState()
  rl.prompt()
}) 
rl.on('close', function () { 
  rl.output.write('goodbye.\n')
  process.exit(0)
})

