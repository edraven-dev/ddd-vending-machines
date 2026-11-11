module.exports = require('../../tools/webpack/nest-app.config.cjs')({
  dirname: __dirname,
  protos: ['atm/atm.proto', 'snack-machine/snack-machine.proto'],
});
