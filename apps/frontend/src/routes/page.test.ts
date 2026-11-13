import { isHttpError } from '@sveltejs/kit';
import { loadSession, saveSession, type Session } from '../lib/session';
import type { PageLoadEvent } from './$types';
import { load } from './+page';

const loadEvent = (fetch: PageLoadEvent['fetch']): PageLoadEvent => ({
  data: null,
  depends: vi.fn<PageLoadEvent['depends']>(),
  fetch,
  params: {},
  parent: () => Promise.resolve({}),
  route: { id: '/' },
  setHeaders: vi.fn<PageLoadEvent['setHeaders']>(),
  tracing: { enabled: false, root: {}, current: {} },
  untrack: (fn) => fn(),
  url: new URL('http://localhost/'),
});

describe('home page load', () => {
  const session: Session = {
    headOfficeId: 'head-office-1',
    atmId: 'atm-1',
    snackMachineId: 'snack-machine-1',
    expiresAt: '2026-11-14T08:00:00.000Z',
  };
  const headOffice = {
    id: 'head-office-1',
    atmIds: ['atm-1'],
    snackMachineIds: ['snack-machine-1'],
    expiresAt: '2026-11-14T08:00:00.000Z',
  };
  const createdHeadOffice = {
    id: 'head-office-2',
    atmIds: ['atm-2', 'atm-3'],
    snackMachineIds: ['snack-machine-2', 'snack-machine-3'],
    expiresAt: '2026-11-14T12:00:00.000Z',
  };
  const createdSession: Session = {
    headOfficeId: 'head-office-2',
    atmId: 'atm-2',
    snackMachineId: 'snack-machine-2',
    expiresAt: '2026-11-14T12:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the head office of the stored session', async () => {
    saveSession(session);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(headOffice));

    await expect(load(loadEvent(fetchMock))).resolves.toStrictEqual({ headOffice });
    expect(fetchMock.mock.calls).toStrictEqual([['/api/management/head-office-1']]);
    expect(loadSession()).toStrictEqual(session);
  });

  it('should start a session with the first atm and snack machine when none is stored', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(createdHeadOffice));

    await expect(load(loadEvent(fetchMock))).resolves.toStrictEqual({ headOffice: createdHeadOffice });
    expect(fetchMock.mock.calls).toStrictEqual([['/api/management', { method: 'POST' }]]);
    expect(loadSession()).toStrictEqual(createdSession);
  });

  it('should start a new session when the stored one has expired', async () => {
    saveSession({ ...session, expiresAt: '2026-11-13T12:00:00.000Z' });
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(createdHeadOffice));

    await expect(load(loadEvent(fetchMock))).resolves.toStrictEqual({ headOffice: createdHeadOffice });
    expect(fetchMock.mock.calls).toStrictEqual([['/api/management', { method: 'POST' }]]);
    expect(loadSession()).toStrictEqual(createdSession);
  });

  it('should start a new session when the head office of the stored one is gone', async () => {
    saveSession(session);
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(Response.json(createdHeadOffice));

    await expect(load(loadEvent(fetchMock))).resolves.toStrictEqual({ headOffice: createdHeadOffice });
    expect(fetchMock.mock.calls).toStrictEqual([
      ['/api/management/head-office-1'],
      ['/api/management', { method: 'POST' }],
    ]);
    expect(loadSession()).toStrictEqual(createdSession);
  });

  it('should fail with the status of a failed head office lookup and keep the session', async () => {
    saveSession(session);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 500 }));

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isHttpError(thrown, 500)).toBe(true);
    expect(fetchMock.mock.calls).toStrictEqual([['/api/management/head-office-1']]);
    expect(loadSession()).toStrictEqual(session);
  });

  it('should fail with the status of a failed session start and store nothing', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 503 }));

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isHttpError(thrown, 503)).toBe(true);
    expect(localStorage.getItem('session')).toBeNull();
  });

  it('should remove the legacy head office id', async () => {
    localStorage.setItem('id', 'head-office-0');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(createdHeadOffice));

    await load(loadEvent(fetchMock));

    expect(localStorage.getItem('id')).toBeNull();
  });
});
