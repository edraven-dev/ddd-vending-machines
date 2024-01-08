export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  const id = localStorage.getItem('id');
  const response = await fetch(`/api/atm/${id}`);
  const atm = await response.json();
  return { atm };
};
