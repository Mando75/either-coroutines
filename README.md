# Either Coroutines

Either Coroutines is an experimental Typescript library seeking to emulate the Either comprehensions and Effect Scopes provided by Kotlin ArrowKT but in the Typescript language.

It provides a minimal implementation of the `Either` monad including the following methods available on the monad instance:
* map
* flatMap
* mapLeft
* isRight
* isLeft
* unwrap

It also includes the following helper functions for dealing with Either monads:
* Either.left -> Creates a new Either as an instance of Left
* Either.right -> Creates a new Either as an instance of Right
* Either.runCatching -> wrap an unsafe function call and return the results as an Either
* Either.runSuspending -> Takes a generator function and allows you to perform comprehensions on any internal Either values. Will short-circuit execution if a Left is found.

## Installation

Not currently available

## Usage

```typescript
import { Either } from './'

// Manually create Either values
const right = Either.right("Hello World")
const left = Either.left(new Error("My Error"))

// Wrap unsafe calls
function unsafe(input: number) {
  if (input % 2 === 0) {
    return input * 2
  }
  throw new Error("Not a multiple of two")
}

const resultA = Either.runCatching(() => unsafe(2))
console.assert(resultA.isRight())

const resultB = Either.runCatching(() => unsafe(5))
console.assert(resultB.isLeft())

// Perform comprehensions using the `yield x.bindValue()` syntax
function doubleEvenNumber(input: number): Either<Error, number> {
  if (input % 2 === 0) {
    return Either.right(input * 2)
  }
  return Either.left(new Error("Not a multiple of two"))
}

const doubleA = Either.runSuspending(function* () {
  const toDouble = 2
  const doubled = yield doubleEvenNumber(toDouble).bindValue()
  
  console.log(`${toDouble} * 2 = ${doubled}`)
  return doubled
})
console.assert(resultA.isRight())

const doubleB = Either.runSuspending(function* () {
  const toDouble = 5
  const doubled = yield doubleEvenNumber(toDouble).bindValue()
  
  // This code will never run because doubleEvenNumber will return a left
  // which will cause `runSuspending` to short-circuit execution
  console.log()
  console.log(`${toDouble} * 2 = ${doubled}`)
  return doubled
})
console.assert(doubleB.isLeft())


```

## Contributing
Code contributions are not open at this time. 

You are free to clone and fork the repo, or provide suggestions as issues, but I will not be accepting any PRs.

## License
[MIT](https://choosealicense.com/licenses/mit/)
