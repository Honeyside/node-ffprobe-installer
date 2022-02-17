'use strict';

const os = require('os');
const path = require('path');

const verifyFile = require('./lib/verify-file');

const platform = os.platform() + '-' + os.arch();

let packageName = '@ffprobe-installer/' + platform;

if (platform === 'darwin-arm64') {
  packageName = 'ffprobe-darwin-arm64';
}

if (!require('./package.json').optionalDependencies[packageName]) {
  throw new Error('Unsupported platform/architecture: ' + platform);
}

const binary = os.platform() === 'win32' ? 'ffprobe.exe' : 'ffprobe';

let folders = (process.pkg ? [path.dirname(process.execPath)] : (require.main ? require.main.paths : [path.dirname(process.argv[0])]));

function getBinPath(folderToSearchIn) {
  const npm3Path = path.resolve(folderToSearchIn, '..', 'node_modules', packageName);
  const npm2Path = path.resolve(folderToSearchIn, 'node_modules', packageName);

  const npm3Binary = path.join(npm3Path, binary);
  const npm2Binary = path.join(npm2Path, binary);

  const npm3Package = path.join(npm3Path, 'package.json');
  const npm2Package = path.join(npm2Path, 'package.json');

  let ffprobePath;
  let packageJson;

  if (verifyFile(npm3Binary)) {
    return { ffprobePath: npm3Binary, packageJson: require(npm3Package) };
  } else if (verifyFile(npm2Binary)) {
    return { ffprobePath: npm3Binary, packageJson: require(npm3Package) };
  }
  return null;
}

let binPaths;

for (const appFolderElement of folders) {
  binPaths = getBinPath(appFolderElement);
  if (binPaths) {
    break;
  }
}

if (!binPaths) {
  throw new Error('Could not find ffprobe executable, searched in "' + folders + '"');
}
const { ffprobePath, packageJson } = binPaths;

const version = packageJson.ffprobe || packageJson.version;
const url = packageJson.homepage;

module.exports = {
  path: ffprobePath,
  version,
  url
};
