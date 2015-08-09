const colorText = require('colors/safe')

function writeView(stream, game) {
  stream.write(`you are player ${game.turn}.\n`)
  stream.write(`there are ${game.clues} clues and ${game.fuses} fuses.\n`)

  game.hands.forEach(function (hand, playerIndex) {
    if (playerIndex === game.turn) return
    writePlayer(stream, playerIndex, hand)
  })

  stream.write(`discards are: ${handString(game.discards)}\n`)
  stream.write(`played are: ${boardString(game.played)}\n`)
}

function writePlayer(stream, player, hand) {
  stream.write(`player ${player} has ${handString(hand)}.\n`)
}

function handString(hand) {
  return Array.from(hand, h => 
    colorText[h.color](`${h.color} ${h.number}`)).join(', \t')
}

function boardString(board) {
  return JSON.stringify(board) // for now
}

// IO
const readline = require('readline')

import { turn } from '../game'
import * as Actions from '../actions'

export function repl() {
  let game = turn(game, new Actions.Shuffle())

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.setPrompt('>')

  // repl

  rl.output.write("let's play.\n")
  writeView(rl.output, game)

  rl.prompt()

  rl.on('line', function (line) {
    // writeView(rl.output, game, currentPlayer)
    rl.prompt()
  }) 
  rl.on('close', function () { 
    rl.output.write('goodbye.\n')
    process.exit(0)
  })
}