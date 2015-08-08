import { isEmpty } from 'lodash'

export function push(object, assignment) {
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

  return Object.create(object, descriptor)
}

export function pop(object) {
  return Object.getPrototypeOf(object)
}

export function splice(array, index, count, ...items) {
  return array.slice().splice()
}