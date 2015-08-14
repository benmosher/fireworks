const colorText = require('colors/safe')

function writeView(stream, game) {
  stream.write(`you are player ${game.turn}.\n`)
  stream.write(`there are ${game.clues} clues and ${game.fuses} fuses.\n`)

  game.hands.forEach(function (hand, playerIndex) {
    if (playerIndex === game.turn) {
      stream.write(`you know: ${knowledgeString(hand, game.knowledge)}\n`)
    } else {
      writePlayer(stream, playerIndex, hand, game.knowledge)
    }
  })

  stream.write(`discards are: ${handString(game.discards)}\n`)
  stream.write(`played are: ${boardString(game.played)}\n`)
}

function writePlayer(stream, player, hand, knowledge) {
  stream.write(`player ${player} has ${handString(hand)}.\n`)
  stream.write(`\tand knows: ${knowledgeString(hand, knowledge)}\n`)
}

const numberMap = {
  1: '  *  ',
  2: ' * * ',
  3: ' *** ',
  4: '** **',
  5: '*****'
}

function handString(hand) {
  return Array.from(hand, h => 
    colorText[h.color](numberMap[h.number])).join(', \t')
}

function knowledgeString(hand, knowledge) {
  function theMoreYouKnow(tile) {
    let k = knowledge.get(tile)
    if (k == null) return '?'
    return `${k.color || '?'} #${k.number || '?'}`
  }

  return Array.from(hand, (tile, index) =>
    `${index}: ${theMoreYouKnow(tile)}`).join(' | ')
}

function boardString(board) {
  return JSON.stringify(board) // for now
}

// IO
const readline = require('readline')

import { colors } from '../deck'
import { turn, currentHand } from '../game'
import * as Actions from '../actions'

export function repl() {
  let plays = [new Actions.Shuffle(), new Actions.Deal(2)]

  let state = plays.reduce(turn, undefined)

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  function write(string) {
    rl.output.write(string)
  }

  rl.setPrompt('>')

  // repl

  rl.output.write("let's play.\n")
  writeView(rl.output, state)

  rl.prompt()

  rl.on('line', function (line) {
    const action = parseTurn(line)
    try {
      if (action != null) state = turn(state, action)
    } catch (err) {
      write(`play error: ${err}\n`)
    }
    writeView(rl.output, state)
    rl.prompt()
  }) 
  rl.on('close', function () { 
    rl.output.write('goodbye.\n')
    process.exit(0)
  })

  const turnTypes = [
    [/play (\d)/, function play([,tileIndex]) {
      const tile = Array.from(currentHand(state))[tileIndex]

      if (tile == null) {
        write("tile not found, try again.\n")
        return null
      }
      return new Actions.Play(tile)
    }],
    [/discard (\d)/, function discard([, tileIndex]) {
      if (tileIndex >= currentHand(state).size) {
        write("invalid tile index")
        return
      }

      return new Actions.Discard(Array.from(currentHand(state))[tileIndex])
    }],
    [ /tell player (\d) about (red|blue|green|yellow|white)?(\d)?/
    , function clue([,player, color, number]) {
      let info
      if (color && colors.has(color)) info = { color }
      if (number && number in numberMap) info = { number: +number }
      if (player >= state.hands.length || !info) {
        write("invalid clue.\n")
        return
      }
      return new Actions.Clue(player, info)
    }]
  ]

  function parseTurn(line) {
    let match
    for (let [pattern, fn] of turnTypes) {
      if (null != (match = pattern.exec(line))) {
        return fn(match)
      }
    }
  }
}