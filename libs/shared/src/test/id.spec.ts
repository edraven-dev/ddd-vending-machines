import { z } from 'zod';
import { Id, idSchema } from '../lib/id';

const v4 = 'ad277203-e35d-4ffe-a03f-6630ea3302cc';
const v7 = '019a7f3e-8c41-7d2a-b5e6-3f9d1c2b4a60';
const otherV7 = '019a7f3e-8c41-7d2a-b5e6-3f9d1c2b4a61';

describe('Id', () => {
  describe('#from', () => {
    it('should accept a lowercase UUID v7', () => {
      expect(Id.from(v7).value).toBe(v7);
    });

    it.each([
      ['v4', v4],
      ['uppercase', v7.toUpperCase()],
      ['nil', '00000000-0000-0000-0000-000000000000'],
      ['max', 'ffffffff-ffff-ffff-ffff-ffffffffffff'],
      ['malformed', 'not-a-uuid'],
      ['empty', ''],
    ])('should reject a %s value', (_name, value) => {
      expect(() => Id.from(value)).toThrow('Id should be a lowercase UUID v7');
    });
  });

  describe('#generate', () => {
    it('should create unique lowercase UUIDs of version 7', () => {
      const ids = Array.from({ length: 100 }, () => Id.generate().value);

      expect(new Set(ids).size).toBe(ids.length);
      expect(() => z.array(z.uuidv7().lowercase()).parse(ids)).not.toThrow();
    });
  });

  describe('#equals', () => {
    it('should compare ids by value', () => {
      expect(Id.from(v7).equals(Id.from(v7))).toBe(true);
      expect(Id.from(v7).equals(Id.from(otherV7))).toBe(false);
    });
  });

  it('should serialize to the bare UUID', () => {
    const id = Id.from(v7);

    expect(String(id)).toBe(v7);
    expect(JSON.stringify({ id })).toBe(`{"id":"${v7}"}`);
  });
});

describe('idSchema', () => {
  it('should parse a UUID v7 into an Id', () => {
    const id = idSchema.parse(v7);

    expect(id).toBeInstanceOf(Id);
    expect(id.value).toBe(v7);
  });

  it('should lowercase the UUID', () => {
    expect(idSchema.parse(v7.toUpperCase()).value).toBe(v7);
  });

  it.each([
    ['v4', v4],
    ['nil', '00000000-0000-0000-0000-000000000000'],
    ['max', 'ffffffff-ffff-ffff-ffff-ffffffffffff'],
    ['malformed', 'not-a-uuid'],
  ])('should reject a %s value with a single issue', (_name, value) => {
    const result = idSchema.safeParse(value);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(['Invalid UUID']);
  });

  it('should describe its input as a uuid string', () => {
    expect(idSchema['~standard'].jsonSchema.input({ target: 'openapi-3.0' })).toMatchObject({
      type: 'string',
      format: 'uuid',
    });
  });
});
