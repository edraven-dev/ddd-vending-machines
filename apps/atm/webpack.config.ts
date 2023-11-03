import { swcDefaultsFactory } from '@nestjs/cli/lib/compiler/defaults/swc-defaults';
import { composePlugins, withNx } from '@nx/webpack';
import { merge } from 'webpack-merge';
const swcDefaultConfig = swcDefaultsFactory().swcOptions;
swcDefaultConfig.jsc.target = 'es2022';

// Nx plugins for webpack.
export default composePlugins(withNx(), (config) => {
  return merge(config, {
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'swc-loader',
            options: swcDefaultConfig,
          },
        },
      ],
    },
  });
});
