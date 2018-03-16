// @flow

// Import types ==============================================================
import type {WebpackStats, AssetMap} from '../../types';

const reduceAssets = (stats: WebpackStats): AssetMap => {
  const {assets, publicPath} = stats;

  const rootPath = publicPath.replace(/\/+$/, '');

  return assets
    .filter((asset) => !/hot-update\.\w+$/.test(asset.name))
    .reduce((reduced, asset) => {
      asset.chunkNames.forEach((chunkName) => {
        if (!reduced[chunkName]) reduced[chunkName] = [];
        reduced[chunkName].push({...asset, url: `${rootPath}/${asset.name}`});
      });
      return reduced;
    }, {});
};

export default reduceAssets;
