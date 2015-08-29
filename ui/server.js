var net = require('net');

var HOST = '0.0.0.0';
var PORT = 55555;

const readline = require('readline')

import { colors } from '../deck'
import { turn, currentHand, isGameOver } from '../game'

import { currentView, numberMap } from './stream'
import * as Actions from '../actions'

let plays = [new Actions.Shuffle()]
let state = plays.reduce(turn, undefined)

/**
 * map from remote address to player registration
 * @type {Map}
 */
let players = []

function playerConnection(sock) {
  sock.write("let's play.\n")
  const rl = readline.createInterface(sock, sock)

  function initPlayer() {
    rl.question("enter your name> ", (name) => {
      // init
      const playerMeta = { 
        index: players.length,
        name,
        rl,
        sock
      }

      players.push(playerMeta)


      sock.write(`thanks, ${name}. you are player ${playerMeta.index}.\n`)
      sock.write("waiting for server to deal game...")

      console.log(`${name} just joined from ${sock.remoteAddress}.`)
    })
  }

  initPlayer()
}

net.createServer(playerConnection).listen(PORT, HOST)
console.log('Server listening on ' + HOST +':'+ PORT);

const serverRL = readline.createInterface(process.stdin, process.stdout)
serverRL.question("press any key to deal game.\n", startGame)

function startGame() {
  const deal = new Actions.Deal(players.length)
  state = turn(state, deal)
  console.log(`dealt in ${deal.playerCount} players.`)

  turnLoop() // callbacks will handle play loop
}

function currentPlayer() {
  return players[state.turn]
}

function turnLoop() {
  players.forEach((player) => {
    if (player.index === state.turn) {
      promptPlay(player)
    } else {
      informOfTurn(player)
    }
  })

  const turnTypes = [
    [/play (\d)/, function play(sock, [,tileIndex]) {
      const tile = Array.from(currentHand(state))[tileIndex]

      if (tile == null) {
        sock.write("tile not found, try again.\n")
        return null
      }
      return new Actions.Play(tile)
    }],
    [/discard (\d)/, function discard(sock, [, tileIndex]) {
      if (tileIndex >= currentHand(state).size) {
        sock.write("invalid tile index")
        return
      }

      return new Actions.Discard(Array.from(currentHand(state))[tileIndex])
    }],
    [ /tell player (\d) about (red|blue|green|yellow|white)?(\d)?/
    , function clue(sock, [,player, color, number]) {
      let info
      if (color && colors.has(color)) info = { color }
      if (number && number in numberMap) info = { number: +number }
      if (player >= state.hands.length || !info) {
        sock.write("invalid clue.\n")
        return
      }
      return new Actions.Clue(player, info)
    }]
  ]

  function informOfTurn({ sock }) {
    sock.write(`${currentPlayer().name}'s turn. waiting for play...\n`)
  }

  function promptPlay({ name, sock, rl, index }) {
    rl.question( `your move, ${name}. what's the play? \n` + 
                 currentView(state, players)
               , handlePlay)

    function handlePlay(play) {
      sock.write(`${play}, great choice.\n`)
      announce(play, name, index)
      turnLoop()
    }
  }


  function announce(play, name, playerIndex) {
    const announcement = `${name} has chosen to ${play}.`
    
    players.forEach(player => {
      if (player.index === playerIndex) return  // continue

      player.sock.write(announcement + '\n')
    })

    // server console, too
    console.log(announcement)
  }
}