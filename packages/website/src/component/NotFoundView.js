// @flow

// Import modules ==============================================================
import * as React from 'react';
import Helmet from 'react-helmet';

class NotFoundView extends React.PureComponent<{}> {
  render() {
    return (
      <div>
        <Helmet>
          <title>Not Found</title>
        </Helmet>
        Not Found
      </div>
    );
  }
}

export default NotFoundView;
