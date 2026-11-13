export interface Session {
  headOfficeId: string;
  atmId: string;
  snackMachineId: string;
  expiresAt: string;
}

const SESSION_KEY = 'session';

const isSession = (value: unknown): value is Session =>
  typeof value === 'object' &&
  value !== null &&
  'headOfficeId' in value &&
  typeof value.headOfficeId === 'string' &&
  'atmId' in value &&
  typeof value.atmId === 'string' &&
  'snackMachineId' in value &&
  typeof value.snackMachineId === 'string' &&
  'expiresAt' in value &&
  typeof value.expiresAt === 'string';

export const loadSession = (now = new Date()): Session | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  if (stored === null) {
    return null;
  }

  let value: unknown;
  try {
    value = JSON.parse(stored);
  } catch {
    return null;
  }

  return isSession(value) && new Date(value.expiresAt) > now ? value : null;
};

export const saveSession = (session: Session): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
