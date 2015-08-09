import { isEmpty } from 'lodash'

export function assign(object, ...assignments) {
  // flatten first
  const assignment = Object.assign({}, ...assignments)

  if (isEmpty(object)) {
    return assignment
  }

  const descriptor = Object.keys(assignment)
    .reduce((acc, key) => { 
      if (object[key] !== assignment[key]) {
        // only for vanilla objects...
        // if (Object.getPrototypeOf(assignment[key]) === Object.prototype) {
        //   // and recurse
        //   acc[key] = { value: protoAssign(object[key], assignment[key]) }
        // } else {
        acc[key] = { value: assignment[key], enumerable: true }
        // }
      }
      return acc
    }, {})

  if (isEmpty(descriptor)) return object

  return Object.freeze(Object.create(object, descriptor))
}

// update method replacements

export function push(array, element) {
  const arr = array.slice()
  arr.push(element)
  return arr
}

export function splice(array, index, count, ...items) {
  return array.slice().splice(index, count, ...items)
}


export function add(set, element) {
  if (set.has(element)) return set

  const clone = new Set(set)
  clone.add(element)

  return clone
}

export function set(map, key, value) {
  if (map.get(key) === value) return map

  const clone = new Map(map)
  clone.set(key, value)
  return clone
}

// todo: chained updates closure version
export function update(map, key, updater) {
  const current = map.get(key)
      , updated = updater(current, key, map)

  if (updated === current) return map

  const clone = new Map(map)
  clone.set(key, updated)
  return clone
}

export function merge(map, other) {
  const clone = new Map(map)
  for (let [key, value] of other) {
    clone.set(key, value)
  }
  return clone
}

// predicates

export function some(iterable, predicate) {
  if (iterable == null) return false

  for (let item of iterable) {
    if (predicate(item)) return true
  }

  return false
}