// @flow

export type Asset = {
  name: string,
  chunkNames: Array<string>,
};

export type WebpackStats = {
  assets: Array<Asset>,
  hash: string,
  publicPath: string,
};

export type AssetWithUrl = Asset & {url: string};

export type AssetMap = {
  [string]: Array<AssetWithUrl>,
};
