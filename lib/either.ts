export namespace Either {
  export interface IEither<A, B> {
    value: A | B;
    bindValue: () => Suspender<A, B>;
    isRight(): this is Right<A, B>;
    isLeft(): this is Left<A, B>;
    flatMap<C>(f: (b: B) => IEither<A, C>): IEither<A, C>;
    map<C>(f: (b: B) => C): IEither<A, C>;
    mapLeft<C>(f: (a: A) => C): IEither<C, B>;
    unwrap(): A | B;
  }

  type Suspender<A, B> = Generator<A, B, B>;
  type SuspenderGenerator<A, B> = Generator<Suspender<A, B>, B, B>;
  type SuspenderFn<A, B> = () => SuspenderGenerator<A, B>;

  export function runSuspending<A, B>(
    suspender: SuspenderFn<A, B>
  ): IEither<A, B> {
    const suspendGenerator = suspender();

    return recursivelyBind(suspendGenerator, undefined) as IEither<A, B>;
  }

  function createBind<A, B>(either: IEither<A, B>) {
    return function* () {
      if (either.isLeft()) {
        yield either.value;
      }
      return (either as Right<A, B>).value;
    };
  }

  function recursivelyBind<A, B>(
    suspender: SuspenderGenerator<A, B>,
    nextVal: B
  ): IEither<A, B> {
    const step = suspender.next(nextVal);

    // No binds were yielded, we can return right
    if (step.done) {
      return right(step.value);
    }

    const bound = step.value.next();

    // Bind returned a right
    // Recursively continue execution for additional binds
    if (bound.done) {
      return recursivelyBind(suspender, bound.value);
    }

    // We found a left, stop execution and return its value
    return left(bound.value);
  }

  export function runCatching<A = unknown, B = unknown>(
    cb: () => B
  ): IEither<A, B> {
    try {
      return right(cb());
    } catch (e) {
      return left(e as A);
    }
  }

  export function left<A, B = never>(value: A): Left<A, B> {
    return new Left<A, B>(value);
  }

  export function right<A = never, B = unknown>(value: B): Right<A, B> {
    return new Right<A, B>(value);
  }

  export class Left<A, B> implements IEither<A, B> {
    constructor(readonly value: A) {}

    bindValue: () => Suspender<A, B> = createBind(this);

    flatMap<C>(f: (b: B) => IEither<A, C>): IEither<A, C> {
      return left(this.value);
    }

    isLeft(): this is Left<A, B> {
      return true;
    }

    isRight(): this is Right<A, B> {
      return !this.isLeft();
    }

    map<C>(f: (b: B) => C): IEither<A, C> {
      return left(this.value);
    }

    mapLeft<C>(f: (a: A) => C): IEither<C, B> {
      return left(f(this.value));
    }

    unwrap(): A | B {
      return this.value;
    }
  }

  export class Right<A, B> implements IEither<A, B> {
    constructor(readonly value: B) {}

    bindValue: () => Suspender<A, B> = createBind(this);

    flatMap<C>(f: (b: B) => IEither<A, C>): IEither<A, C> {
      return f(this.value);
    }

    isLeft(): this is Left<A, B> {
      return !this.isRight();
    }

    isRight(): this is Right<A, B> {
      return true;
    }

    map<C>(f: (b: B) => C): IEither<A, C> {
      return right(f(this.value));
    }

    mapLeft<C>(f: (a: A) => C): IEither<C, B> {
      return right(this.value);
    }

    unwrap(): A | B {
      return this.value;
    }
  }
}
