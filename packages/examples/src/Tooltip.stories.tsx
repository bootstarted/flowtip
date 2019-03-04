import * as React from 'react';
import {storiesOf} from '@storybook/react';
// import {withKnobs, object} from '@storybook/addon-knobs/react';

import StyleReset from './StyleReset';
import Draggable from './Draggable';
import Tooltip from './Tooltip';

storiesOf('Tooltip', module)
  // .addDecorator(withKnobs)
  .addDecorator((story) => (
    <>
      <StyleReset />
      {story()}
    </>
  ))

  .add('basic', () => (
    <div>
      <Tooltip content="tooltip">label</Tooltip>
    </div>
  ))

  .add('torture test', () => (
    <div
      style={{
        margin: 40,
        position: 'relative',
        height: 180,
        width: 180,
        border: '10px solid blue',
        overflow: 'scroll',
      }}
    >
      <div style={{height: 400}}>
        <Tooltip content="tooltip" hideDelay={999999}>
          {(setTarget) => <Draggable onReflow={setTarget}>label</Draggable>}
        </Tooltip>
      </div>
    </div>
  ));
