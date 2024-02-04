import pick from '../../../../src/utils/pick/pick';

describe('pick', () => {
  it('should return an object with picked properties', () => {
    const object = { a: 1, b: 2, c: 3 };
    const keys = ['a', 'c'];
    const result = pick(object, keys);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should ignore non-existing properties', () => {
    const object = { a: 1, b: 2, c: 3 };
    const keys = ['a', 'd'];
    const result = pick(object, keys);
    expect(result).toEqual({ a: 1 });
  });

  it('should return an empty object if no keys are provided', () => {
    const object = { a: 1, b: 2, c: 3 };
    const keys: string[] = [];
    const result = pick(object, keys);
    expect(result).toEqual({});
  });

  it('should return an empty object if source object is null or undefined', () => {
    const keys = ['a', 'b'];
    const result = pick({}, keys);
    expect(result).toEqual({});
  });
});
