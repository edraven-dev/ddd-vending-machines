import { nestApp } from '../../tools/tsdown/nest-app.ts';

export default nestApp({ protos: ['atm/atm.proto', 'snack-machine/snack-machine.proto'] });
