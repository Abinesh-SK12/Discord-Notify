describe('Simple Math Tests', () => {
  it('should add numbers correctly', () => {
    expect(2 + 2).to.equal(4)
    expect(10 + 5).to.equal(15)
    expect(100 + 200).to.equal(300)
  })

  it('should subtract numbers correctly', () => {
    expect(10 - 5).to.equal(5)
    expect(100 - 50).to.equal(50)
    expect(1000 - 1).to.equal(999)
  })

  it('should multiply numbers correctly', () => {
    expect(3 * 3).to.equal(9)
    expect(5 * 10).to.equal(50)
    expect(7 * 8).to.equal(56)
  })

  it('should compare strings correctly', () => {
    expect('hello').to.equal('hello')
    expect('Hello World').to.include('World')
    expect('Cypress').to.have.length(7)
  })

  it('should work with arrays', () => {
    const fruits = ['apple', 'banana', 'orange']
    expect(fruits).to.have.length(3)
    expect(fruits).to.include('banana')
    expect(fruits[0]).to.equal('apple')
  })

  it('should work with objects', () => {
    const user = { name: 'John', age: 30 }
    expect(user).to.have.property('name', 'John')
    expect(user).to.have.property('age', 30)
    expect(user).to.deep.equal({ name: 'John', age: 30 })
  })
})