// @flow

// Import modules ==============================================================
import * as React from 'react';
import Helmet from 'react-helmet';

// Import components ===========================================================
import ExampleWrapper from './ExampleWrapper';

class LandingView extends React.PureComponent<{}> {
  render() {
    return (
      <div>
        <Helmet>
          <title>Landing</title>
        </Helmet>
        <ExampleWrapper />
      </div>
    );
  }
}

export default LandingView;
