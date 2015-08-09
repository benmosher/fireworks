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
        acc[key] = { value: assignment[key] }
        // }
      }
      return acc
    }, {})

  if (isEmpty(descriptor)) return object

  return Object.freeze(Object.create(object, descriptor))
}

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