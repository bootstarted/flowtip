// @flow

// Import modules ==============================================================
import * as React from 'react';

// Import types ================================================================
import type {AssetMap} from '../../../types';

const scripts = (assets = []) =>
  assets
    .filter((asset) => /\.js$/.test(asset.name))
    .map((asset) => <script src={asset.url} key={asset.name} />);

const styles = (assets = []) =>
  assets
    .filter((asset) => /\.css$/.test(asset.name))
    .map((asset) => (
      <link
        rel="stylesheet"
        type="text/css"
        href={asset.url}
        key={asset.name}
      />
    ));

type Props = {
  rootElementId: string,
  markup: string,
  assets: AssetMap,
  head: React$Node,
  // flowlint unclear-type: off
  htmlAttributes: any,
  bodyAttributes: any,
  // flowlint unclear-type: error
};

class Page extends React.PureComponent<Props> {
  render() {
    const {
      rootElementId,
      assets,
      markup,
      head,
      htmlAttributes,
      bodyAttributes,
    } = this.props;
    return (
      <html lang="en" {...htmlAttributes}>
        <head>
          <meta charSet="utf-8" />
          {head}
          {styles(assets.index)}
        </head>
        <body {...bodyAttributes}>
          <div
            id={rootElementId}
            className="root"
            dangerouslySetInnerHTML={{__html: markup}}
          />
          {scripts(assets.index)}
        </body>
      </html>
    );
  }
}

export default Page;
