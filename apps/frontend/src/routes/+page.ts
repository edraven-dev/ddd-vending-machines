import { PUBLIC_API_HOST } from '$env/static/public';

export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  const response = await fetch(`${PUBLIC_API_HOST}/api/snack-machine`);
  const snackMachine = await response.json();
  return { snackMachine };
};
