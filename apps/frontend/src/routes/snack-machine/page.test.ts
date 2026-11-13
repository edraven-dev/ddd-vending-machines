import { isHttpError, isRedirect } from '@sveltejs/kit';
import { saveSession, type Session } from '../../lib/session';
import type { PageLoadEvent } from './$types';
import { load } from './+page';

const loadEvent = (fetch: PageLoadEvent['fetch']): PageLoadEvent => ({
  data: null,
  depends: vi.fn<PageLoadEvent['depends']>(),
  fetch,
  params: {},
  parent: () => Promise.resolve({}),
  route: { id: '/snack-machine' },
  setHeaders: vi.fn<PageLoadEvent['setHeaders']>(),
  tracing: { enabled: false, root: {}, current: {} },
  untrack: (fn) => fn(),
  url: new URL('http://localhost/snack-machine'),
});

describe('snack machine page load', () => {
  const session: Session = {
    headOfficeId: 'head-office-1',
    atmId: 'atm-1',
    snackMachineId: 'snack-machine-1',
    expiresAt: '2026-11-14T08:00:00.000Z',
  };
  const snackMachine = { id: 'snack-machine-1' };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-13T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the snack machine of the stored session', async () => {
    saveSession(session);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(snackMachine));

    await expect(load(loadEvent(fetchMock))).resolves.toStrictEqual({ snackMachine });
    expect(fetchMock.mock.calls).toStrictEqual([['/api/snack-machine/snack-machine-1']]);
  });

  it('should redirect home when no session is stored', async () => {
    const fetchMock = vi.fn<typeof fetch>();

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ status: 307, location: '/' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should redirect home when the stored session has expired', async () => {
    saveSession({ ...session, expiresAt: '2026-11-13T12:00:00.000Z' });
    const fetchMock = vi.fn<typeof fetch>();

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ status: 307, location: '/' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should redirect home when the snack machine is gone', async () => {
    saveSession(session);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 404 }));

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isRedirect(thrown)).toBe(true);
    expect(thrown).toMatchObject({ status: 307, location: '/' });
    expect(fetchMock.mock.calls).toStrictEqual([['/api/snack-machine/snack-machine-1']]);
  });

  it('should fail with the status of a failed snack machine lookup', async () => {
    saveSession(session);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(null, { status: 500 }));

    const thrown = await load(loadEvent(fetchMock)).catch((caught: unknown) => caught);

    expect(isHttpError(thrown, 500)).toBe(true);
  });
});
