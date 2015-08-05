const _ = require('lodash')
const readline = require('readline')

import { GameState, writeView } from './game'

let currentPlayer = 0
const game = new GameState(4)

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.setPrompt('>')

// repl

rl.output.write("let's play.\n")
writeView(rl.output, game, currentPlayer)

rl.prompt()

rl.on('line', function (line) {
  writeView(rl.output, game, currentPlayer)
  rl.prompt()
}) 
rl.on('close', function () { 
  rl.output.write('goodbye.\n')
  process.exit(0)
})

