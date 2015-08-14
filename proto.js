export function assign(object, ...assignments) {
  return Object.freeze(Object.assign({}, object, ...assignments))
}

// update method replacements

export function push(array, element) {
  const arr = array.slice()
  arr.push(element)
  return arr
}

export function splice(array, index, count, ...items) {
  let clone = array.slice()
  clone.splice(index, count, ...items)
  return clone
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

// iterables

export function some(iterable, predicate) {
  if (iterable == null) return false

  for (let item of iterable) {
    if (predicate(item)) return true
  }

  return false
}

export function first(iterable) {
  return iterable[Symbol.iterator]().next().value
}

export function* filter(iterable, predicate) {
  for (let item of iterable) {
    if (predicate(item)) {
      yield item
    }
  }
}