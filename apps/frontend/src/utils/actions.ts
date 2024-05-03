import { toast } from '@zerodevx/svelte-toast';

export const success = (message: string) =>
  toast.push(message, {
    theme: {
      '--toastColor': 'mintcream',
      '--toastBackground': 'rgba(72, 187, 120, 0.9)',
      '--toastBarBackground': '#2F855A',
    },
  });

export const warning = (message: string) =>
  toast.push(message, {
    theme: {
      '--toastColor': 'black',
      '--toastBackground': 'rgba(253, 218, 13, 0.9)',
      '--toastBarBackground': '#8B8000',
    },
  });

export const failure = (message: string) =>
  toast.push(message, {
    theme: {
      '--toastColor': 'white',
      '--toastBackground': 'rgba(155, 0, 0, 0.9)',
      '--toastBarBackground': '#5d0f02',
    },
  });
