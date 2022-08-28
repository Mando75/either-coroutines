import { Either } from "./either";
import { vi } from "vitest";
import right = Either.right;
import left = Either.left;

describe("Either", () => {
  const success = Symbol("success");
  const failure = Symbol("failure");

  describe("runCatching", () => {
    const resolves = (): Symbol => success;
    const rejects = (): Symbol => {
      throw failure;
    };

    it("should return a Right value for a successful run", () => {
      const result = Either.runCatching(resolves);
      expect(result.isRight()).toBe(true);
      expect(result.unwrap()).toBe(success);
    });

    it("should return a Left value for a failure run", () => {
      const result = Either.runCatching(rejects);
      expect(result.isLeft()).toBe(true);
      expect(result.unwrap()).toBe(failure);
    });
  });

  describe("bindValue", () => {
    it("should work when no bound values are passed", () => {
      const result = Either.runSuspending<never, Symbol>(function* () {
        return success;
      });

      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(success);
    });

    it("should bind right values and return the result", () => {
      const rightBinding = () => right(success);

      const result = Either.runSuspending<never, Symbol>(function* () {
        const r = yield rightBinding().bindValue();

        expect(r).toBe(success);
        return r;
      });

      expect(result.isRight()).toBe(true);
      expect(result.value).toBe(success);
    });

    it("should short circuit evaluation if left value is found", () => {
      const shouldNotBeCalled = vi.fn().mockReturnValue("Hello world");
      const leftBinding = () => left(failure);

      const result = Either.runSuspending<Symbol, string>(function* () {
        yield leftBinding().bindValue();

        return shouldNotBeCalled();
      });

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBe(failure);
      expect(shouldNotBeCalled).not.toHaveBeenCalled();
    });
  });
});
