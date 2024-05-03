export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  let id = localStorage.getItem('id');
  if (!id) {
    id = window.crypto.randomUUID();
    localStorage.setItem('id', id);
  }
  let response = await fetch(`/api/management/${id}`);
  if (!response.ok) {
    if (response.status !== 404) {
      throw new Error('Unexpected response');
    }
    await init(id);
    response = await fetch(`/api/management/${id}`);
  }
  const headOffice = await response.json();
  return { headOffice };
};

async function init(id: string) {
  await Promise.all([
    fetch(`/api/management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }),
    fetch(`/api/atm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }),
    fetch(`/api/snack-machine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    }),
  ]);
}
