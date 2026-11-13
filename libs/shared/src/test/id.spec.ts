import { Id, idSchema, toId } from '../lib/id';

const v4 = 'ad277203-e35d-4ffe-a03f-6630ea3302cc';
const v7 = '019a7f3e-8c41-7d2a-b5e6-3f9d1c2b4a60';

describe('Id', () => {
  describe('#from', () => {
    it.each([v4, v7])('should accept the lowercase UUID %s', (value) => {
      expect(Id.from(value).value).toBe(value);
    });

    it.each([
      ['uppercase', v7.toUpperCase()],
      ['nil', '00000000-0000-0000-0000-000000000000'],
      ['max', 'ffffffff-ffff-ffff-ffff-ffffffffffff'],
      ['malformed', 'not-a-uuid'],
      ['empty', ''],
    ])('should reject a %s value', (_name, value) => {
      expect(() => Id.from(value)).toThrow('Id should match pattern');
    });
  });

  describe('#generate', () => {
    it('should create unique lowercase UUIDs of version 7', () => {
      const ids = Array.from({ length: 100 }, () => Id.generate().value);

      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach((id) => expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
    });
  });

  describe('#equals', () => {
    it('should compare ids by value', () => {
      expect(Id.from(v4).equals(Id.from(v4))).toBe(true);
      expect(Id.from(v4).equals(Id.from(v7))).toBe(false);
    });
  });

  it('should serialize to the bare UUID', () => {
    const id = Id.from(v7);

    expect(String(id)).toBe(v7);
    expect(JSON.stringify({ id })).toBe(`{"id":"${v7}"}`);
  });
});

describe('idSchema', () => {
  it('should parse a UUID of any version into an Id', () => {
    const v4Id = idSchema.parse(v4);
    const v7Id = idSchema.parse(v7);

    expect(v4Id).toBeInstanceOf(Id);
    expect(v4Id.value).toBe(v4);
    expect(v7Id.value).toBe(v7);
  });

  it('should lowercase the UUID', () => {
    expect(idSchema.parse(v7.toUpperCase()).value).toBe(v7);
  });

  it.each([
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

describe('toId', () => {
  it('should parse a string and keep an Id', () => {
    const id = Id.from(v7);

    expect(toId(v7)).toEqual(id);
    expect(toId(id)).toBe(id);
  });
});
