export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  const response = await fetch('/api/atm');
  const atm = await response.json();
  return { atm };
};
