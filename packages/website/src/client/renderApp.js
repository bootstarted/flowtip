// @flow

// Import modules ==============================================================
import * as React from 'react';
import ReactDOM from './ReactDOM';
import {BrowserRouter as Router} from 'react-router-dom';

// Import components ===========================================================
import AppRoot from '../component/AppRoot';

const renderApp = () => {
  const root = document.getElementById(AppRoot.rootElementId);

  if (root === null) {
    throw new Error('AppRoot root element is null');
  }

  ReactDOM.render(
    <Router>
      <AppRoot />
    </Router>,
    root,
  );
};

export default renderApp;
