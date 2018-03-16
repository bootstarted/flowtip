// @flow

// Import modules ==============================================================
import * as React from 'react';
import {Switch, Route} from 'react-router-dom';
import {hot} from 'react-hot-loader';

// Import components ===========================================================
import LandingView from './LandingView';
import NotFoundView from './NotFoundView';

class AppRoot extends React.PureComponent<{}> {
  static rootElementId = 'app';

  render() {
    return (
      <Switch>
        <Route exact path="/" component={LandingView} />
        <Route component={NotFoundView} />
      </Switch>
    );
  }
}

export default hot(module)(AppRoot);
