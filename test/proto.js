import { expect } from 'chai'

import { assign } from '../proto'

describe("proto - assign", function () {
  let foo, bar
  before(() => {
    foo = { a: 1, b: 2 }
    bar = assign(foo, { b: 3, c: 4})
  })

  it("is a new object", function () {
    expect(bar).not.to.equal(foo)
  })

  it("has all values", function () {
    expect(bar).property('a', 1)
    expect(bar).property('b', 3)
    expect(bar).property('c', 4)
  })

  it("did not mutate foo", function () {
    expect(foo).property('a', 1)
    expect(foo).property('b', 2)
    expect(foo).not.to.have.property('c')
  })

  it("impl detail: foo is bar's prototype", function () {
    expect(foo).to.equal(bar.__proto__)
  })
})