import '@types/jest';

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> {
    (...args: Y): T;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
    mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
    mockReturnThis(): Mock<T, Y>;
    mockReturnValue(value: T): Mock<T, Y>;
    mockReturnValueOnce(value: T): Mock<T, Y>;
    mockResolvedValue(value: T): Mock<Promise<T>, Y>;
    mockResolvedValueOnce(value: T): Mock<Promise<T>, Y>;
    mockRejectedValue(value: any): Mock<Promise<any>, Y>;
    mockRejectedValueOnce(value: any): Mock<Promise<any>, Y>;
  }

  interface MockInstance<T = any, Y extends any[] = any> {
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
    mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
    mockReturnThis(): Mock<T, Y>;
    mockReturnValue(value: T): Mock<T, Y>;
    mockReturnValueOnce(value: T): Mock<T, Y>;
    mockResolvedValue(value: T): Mock<Promise<T>, Y>;
    mockResolvedValueOnce(value: T): Mock<Promise<T>, Y>;
    mockRejectedValue(value: any): Mock<Promise<any>, Y>;
    mockRejectedValueOnce(value: any): Mock<Promise<any>, Y>;
  }

  function fn<T = any, Y extends any[] = any>(): Mock<T, Y>;
  function fn<T = any, Y extends any[] = any>(implementation: (...args: Y) => T): Mock<T, Y>;
}

declare global {
  const jest: any;
} 