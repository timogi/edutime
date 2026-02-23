const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

const path = require('path');
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the shared package source so Metro can resolve @edutime/shared
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages/shared'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Disable package.json exports resolution for Supabase compatibility
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: "./global.css" });
