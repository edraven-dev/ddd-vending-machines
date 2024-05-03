export const load = async (loadEvent) => {
  const { fetch } = loadEvent;

  const id = localStorage.getItem('id');
  const response = await fetch(`/api/snack-machine/${id}`);
  const snackMachine = await response.json();
  return { snackMachine };
};
