// @flow

// Import modules ==============================================================
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import {StaticRouter} from 'react-router-dom';
import Helmet from 'react-helmet';

// Import types ================================================================
import type {WebpackStats} from '../../types';

// Import components ===========================================================
import AppRoot from '../component/AppRoot';
import Page from './component/Page';

import reduceAssets from './reduceAssets';

type Options = {
  stats: WebpackStats,
  path: string,
};

const renderPage = ({markup, helmet, assets}) => {
  return ReactDOMServer.renderToStaticMarkup(
    <Page
      assets={assets}
      // head={
      // <React.Fragment>
      // {helmet.title.toComponent()}
      // {helmet.meta.toComponent()}
      // {helmet.link.toComponent()}
      // {helmet.style.toComponent()}
      // </React.Fragment>
      // }
      htmlAttributes={helmet.htmlAttributes.toComponent()}
      bodyAttributes={helmet.bodyAttributes.toComponent()}
      markup={markup}
      rootElementId={AppRoot.rootElementId}
    />,
  );
};

const renderApp = ({path, stats}: Options) => {
  const routerContext = {};

  const markup = ReactDOMServer.renderToStaticMarkup(
    <StaticRouter location={path} context={routerContext}>
      <AppRoot />
    </StaticRouter>,
  );

  const helmet = Helmet.renderStatic();

  return {markup: renderPage({markup, helmet, assets: reduceAssets(stats)})};
};

export default renderApp;
