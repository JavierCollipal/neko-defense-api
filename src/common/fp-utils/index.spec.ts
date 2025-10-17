// 🐾🧪 NEKO DEFENSE - FP Utilities Unit Tests 🧪🐾
import {
  DbError,
  ValidationError,
  NotFoundError,
  toDbError,
  toValidationError,
  toNotFoundError,
  log,
  tap,
} from './index';

describe('FP Utilities', () => {
  describe('Error Constructors', () => {
    describe('toDbError', () => {
      it('should create DbError from unknown error', () => {
        const originalError = new Error('Connection failed');
        const dbError = toDbError(originalError);

        expect(dbError).toBeInstanceOf(DbError);
        expect(dbError.name).toBe('DbError');
        expect(dbError.message).toContain('Database operation failed');
        expect(dbError.cause).toBe(originalError);
      });

      it('should return existing DbError unchanged', () => {
        const existing = new DbError('Already a DbError');
        const result = toDbError(existing);

        expect(result).toBe(existing);
      });

      it('should handle string errors', () => {
        const dbError = toDbError('Simple string error');

        expect(dbError).toBeInstanceOf(DbError);
        expect(dbError.message).toContain('Simple string error');
      });

      it('should handle null/undefined errors', () => {
        const dbError1 = toDbError(null);
        const dbError2 = toDbError(undefined);

        expect(dbError1).toBeInstanceOf(DbError);
        expect(dbError2).toBeInstanceOf(DbError);
      });
    });

    describe('toValidationError', () => {
      it('should create ValidationError with message only', () => {
        const error = toValidationError('Invalid input');

        expect(error).toBeInstanceOf(ValidationError);
        expect(error.name).toBe('ValidationError');
        expect(error.message).toBe('Invalid input');
        expect(error.fields).toBeUndefined();
      });

      it('should create ValidationError with field errors', () => {
        const fields = { email: 'Invalid email', age: 'Must be positive' };
        const error = toValidationError('Validation failed', fields);

        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('Validation failed');
        expect(error.fields).toEqual(fields);
      });

      it('should handle empty fields object', () => {
        const error = toValidationError('No fields', {});

        expect(error.fields).toEqual({});
      });
    });

    describe('toNotFoundError', () => {
      it('should create NotFoundError with ID', () => {
        const error = toNotFoundError('user-123');

        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.name).toBe('NotFoundError');
        expect(error.message).toBe('Resource not found');
        expect(error.id).toBe('user-123');
      });

      it('should handle empty string ID', () => {
        const error = toNotFoundError('');

        expect(error.id).toBe('');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('log', () => {
      it('should log message and return value unchanged', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const value = { test: 'data' };

        const result = log('Test message')(value);

        expect(result).toBe(value);
        expect(consoleSpy).toHaveBeenCalledWith('Test message', value);

        consoleSpy.mockRestore();
      });

      it('should work with primitive values', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const result1 = log('Number')(42);
        const result2 = log('String')('hello');
        const result3 = log('Boolean')(true);

        expect(result1).toBe(42);
        expect(result2).toBe('hello');
        expect(result3).toBe(true);

        consoleSpy.mockRestore();
      });

      it('should work with null and undefined', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        const result1 = log('Null')(null);
        const result2 = log('Undefined')(undefined);

        expect(result1).toBeNull();
        expect(result2).toBeUndefined();

        consoleSpy.mockRestore();
      });
    });

    describe('tap', () => {
      it('should execute side effect and return value unchanged', () => {
        let sideEffect = 0;
        const value = { count: 5 };

        const result = tap((v: any) => {
          sideEffect = v.count * 2;
        })(value);

        expect(result).toBe(value);
        expect(sideEffect).toBe(10);
      });

      it('should work with void side effects', () => {
        let called = false;

        const result = tap(() => {
          called = true;
        })('test');

        expect(result).toBe('test');
        expect(called).toBe(true);
      });

      it('should handle thrown errors in side effect', () => {
        const value = 'test';

        expect(() => {
          tap(() => {
            throw new Error('Side effect error');
          })(value);
        }).toThrow('Side effect error');
      });
    });
  });

  describe('Type Guards', () => {
    it('DbError should have correct properties', () => {
      const error = new DbError('Test error', new Error('Cause'));

      expect(error.name).toBe('DbError');
      expect(error.message).toBe('Test error');
      expect(error.cause).toBeInstanceOf(Error);
    });

    it('ValidationError should have correct properties', () => {
      const fields = { field1: 'error1' };
      const error = new ValidationError('Validation failed', fields);

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.fields).toEqual(fields);
    });

    it('NotFoundError should have correct properties', () => {
      const error = new NotFoundError('Not found', 'id-123');

      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Not found');
      expect(error.id).toBe('id-123');
    });
  });
});
