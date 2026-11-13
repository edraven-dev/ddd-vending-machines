import { error, redirect } from '@sveltejs/kit';
import { loadSession } from '../../lib/session';

export const load = async ({ fetch }) => {
  const session = loadSession();
  if (!session) {
    redirect(307, '/');
  }

  const response = await fetch(`/api/atm/${session.atmId}`);
  if (response.status === 404) {
    redirect(307, '/');
  }
  if (!response.ok) {
    error(response.status, 'Could not load the ATM');
  }
  return { atm: await response.json() };
};
