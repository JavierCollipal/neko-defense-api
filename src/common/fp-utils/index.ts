// 🐾⚡ NEKO DEFENSE - Functional Programming Utilities ⚡🐾
// Pure functional utilities for immutable operations, nyaa~!

// Re-export fp-ts essentials
export { pipe, flow } from 'fp-ts/function';
export * as E from 'fp-ts/Either';
export * as O from 'fp-ts/Option';
export * as TE from 'fp-ts/TaskEither';
export * as T from 'fp-ts/Task';
export * as A from 'fp-ts/Array';
export * as R from 'fp-ts/Record';
export * as NEA from 'fp-ts/NonEmptyArray';

// Type-safe readonly utilities
export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
};

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Custom error types
export class DbError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DbError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string, public readonly id?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Error constructors (pure functions)
export const toDbError = (error: unknown): DbError =>
  error instanceof DbError
    ? error
    : new DbError(`Database operation failed: ${error}`, error);

export const toValidationError = (message: string, fields?: Record<string, string>): ValidationError =>
  new ValidationError(message, fields);

export const toNotFoundError = (id: string): NotFoundError =>
  new NotFoundError(`Resource not found`, id);

// Note: fromNullable and tryCatchTask are available from fp-ts directly
// No need to re-export them here as they're already exported via * as O and * as TE

// Utility: Log (side effect contained)
export const log = (message: string) => <A>(value: A): A => {
  console.log(message, value);
  return value;
};

// Utility: Tap (perform side effect without changing value)
export const tap = <A>(f: (a: A) => void) => (value: A): A => {
  f(value);
  return value;
};
