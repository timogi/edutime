const path = require('path');
const Module = require('module');
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Ensure hoisted packages can resolve react-native from the mobile workspace.
process.env.NODE_PATH = [
  path.resolve(projectRoot, 'node_modules'),
  process.env.NODE_PATH,
]
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require("nativewind/metro");

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
