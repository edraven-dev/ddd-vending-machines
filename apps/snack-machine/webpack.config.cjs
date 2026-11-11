module.exports = require('../../tools/webpack/nest-app.config.cjs')({
  dirname: __dirname,
  protos: ['snack-machine/snack-machine.proto'],
  swcTarget: 'es5', // TODO: check why es2022 stopped working (carried over from the Nx webpack config)
});
