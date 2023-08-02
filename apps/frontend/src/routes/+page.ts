import { PUBLIC_API_HOST } from '$env/static/public';

export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  const response = await fetch(`${PUBLIC_API_HOST}/api/snack-machine/money-in-machine`);
  const moneyInMachine = await response.json();
  return { moneyInMachine };
};
