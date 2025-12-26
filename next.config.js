/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: false,
        dirs: ['app', 'components', 'utils', 'workers']
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    // Override the default webpack configuration
    webpack: (config, { isServer, webpack }) => {
        // See https://webpack.js.org/configuration/resolve/#resolvealias
        config.resolve.alias = {
            ...config.resolve.alias,
            "sharp$": false,
            "onnxruntime-node$": false,
        }
        config.externals["node:fs"] = "commonjs node:fs";
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            asyncWebAssembly:true
        };
        config.module.rules.push({
            test: /\.md$/i,
            use: "raw-loader",
          });
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback, 
                fs: false,
            };
        }
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(
              /^node:/,
              (resource) => {
                resource.request = resource.request.replace(/^node:/, '');
              },
            ),
          );
        return config;
    },
}

module.exports = nextConfig;
