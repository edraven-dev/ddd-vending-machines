import { loadSession, saveSession, type Session } from './session';

const session: Session = {
  headOfficeId: 'head-office-1',
  atmId: 'atm-1',
  snackMachineId: 'snack-machine-1',
  expiresAt: '2026-11-14T12:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadSession', () => {
  const now = new Date('2026-11-13T12:00:00.000Z');

  it('should return the stored session', () => {
    localStorage.setItem('session', JSON.stringify(session));

    expect(loadSession(now)).toStrictEqual(session);
  });

  it('should return null when no session is stored', () => {
    expect(loadSession(now)).toBeNull();
  });

  it.each([
    ['not JSON', '{not json'],
    ['null', 'null'],
    ['a plain string', '"head-office-1"'],
    [
      'a session without a head office id',
      JSON.stringify({ atmId: 'atm-1', snackMachineId: 'snack-machine-1', expiresAt: session.expiresAt }),
    ],
    ['a session with a numeric atm id', JSON.stringify({ ...session, atmId: 1 })],
    [
      'a session without a snack machine id',
      JSON.stringify({ headOfficeId: 'head-office-1', atmId: 'atm-1', expiresAt: session.expiresAt }),
    ],
    ['a session with a numeric expiry', JSON.stringify({ ...session, expiresAt: Date.parse(session.expiresAt) })],
  ])('should return null when the stored value is %s', (_description, stored) => {
    localStorage.setItem('session', stored);

    expect(loadSession(now)).toBeNull();
  });

  it('should return the session until the moment it expires', () => {
    localStorage.setItem('session', JSON.stringify(session));

    expect(loadSession(new Date('2026-11-14T11:59:59.999Z'))).toStrictEqual(session);
    expect(loadSession(new Date('2026-11-14T12:00:00.000Z'))).toBeNull();
  });

  it('should check the expiry against the current time by default', () => {
    localStorage.setItem('session', JSON.stringify(session));
    vi.useFakeTimers({ toFake: ['Date'] });

    vi.setSystemTime(new Date('2026-11-14T11:59:59.999Z'));
    expect(loadSession()).toStrictEqual(session);

    vi.setSystemTime(new Date('2026-11-14T12:00:00.000Z'));
    expect(loadSession()).toBeNull();
  });
});

describe('saveSession', () => {
  it('should store the session as JSON under the session key', () => {
    saveSession(session);

    expect(localStorage.getItem('session')).toBe(JSON.stringify(session));
  });

  it('should store a session that loadSession returns', () => {
    saveSession(session);

    expect(loadSession(new Date('2026-11-13T12:00:00.000Z'))).toStrictEqual(session);
  });
});
