import { first, keys } from 'lodash'

export default class PlayerView {
  constructor(game, player) {
    this.game = game
    this.player = player
    this.knowledge = [null, null, null, null]
  }

  learn(indexes, info) {
    this.knowledge = this.knowledge.map(updater(indexes, info))
  }
}


function updater(indexes, info) {
  return function (knowledge, index) {
    // positive knowledge
    if (indexes.has(index)) {
      return Object.assign(knowledge || {}, info)
    }

    // otherwise, apply negative knowledge
    let not = knowledge.not || { color: new Set(), number: new Set() }
      , type = first(keys(info))

    not[type].add(info[type])
  }
}