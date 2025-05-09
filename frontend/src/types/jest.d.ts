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
    mockName(name: string): Mock<T, Y>;
    getMockName(): string;
    mock: {
      calls: Y[];
      instances: T[];
      invocationCallOrder: number[];
      results: Array<{
        type: 'return' | 'throw';
        value: T;
      }>;
      lastCall: Y;
    };
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
    mockName(name: string): Mock<T, Y>;
    getMockName(): string;
  }

  function fn<T = any, Y extends any[] = any>(): Mock<T, Y>;
  function fn<T = any, Y extends any[] = any>(implementation: (...args: Y) => T): Mock<T, Y>;
  function spyOn<T extends {}, M extends keyof T>(object: T, method: M): Mock;
  function clearAllMocks(): void;
  function resetAllMocks(): void;
  function restoreAllMocks(): void;
}

declare global {
  const jest: typeof import('@types/jest');
} 