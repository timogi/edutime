const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

const path = require('path');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Disable package.json exports resolution for Supabase compatibility
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });