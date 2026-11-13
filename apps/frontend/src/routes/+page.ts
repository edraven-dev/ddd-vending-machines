import { error } from '@sveltejs/kit';
import { loadSession, saveSession } from '../lib/session';

export const load = async ({ fetch }) => {
  localStorage.removeItem('id');

  const session = loadSession();
  if (session) {
    const response = await fetch(`/api/management/${session.headOfficeId}`);
    if (response.ok) {
      return { headOffice: await response.json() };
    }
    if (response.status !== 404) {
      error(response.status, 'Could not load the head office');
    }
  }

  const response = await fetch('/api/management', { method: 'POST' });
  if (!response.ok) {
    error(response.status, 'Could not start a session');
  }
  const headOffice = await response.json();
  saveSession({
    headOfficeId: headOffice.id,
    atmId: headOffice.atmIds[0],
    snackMachineId: headOffice.snackMachineIds[0],
    expiresAt: headOffice.expiresAt,
  });
  return { headOffice };
};
