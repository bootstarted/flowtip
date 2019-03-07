import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {withKnobs, boolean} from '@storybook/addon-knobs/react';

import StoryDecorator from '../../../.storybook/src/StoryDecorator';
import Draggable from './Draggable';
import Tooltip from './Tooltip';
import Playground from './Playground';

const stories = storiesOf('Tooltip', module);

stories.addDecorator(withKnobs);

stories.addDecorator((story) => <StoryDecorator>{story()}</StoryDecorator>);

stories.add('basic', () => (
  <div>
    <Tooltip content="tooltip">label</Tooltip>
  </div>
));

stories.add('anchor test', () => (
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

stories.add('playground', () => (
  <Playground
    snap={{
      top: [
        boolean('snap top left', true, 'snap') ? 0 : undefined,
        boolean('snap top center', true, 'snap') ? 0.5 : undefined,
        boolean('snap top right', true, 'snap') ? 1 : undefined,
      ].filter((val) => val !== undefined) as number[],
      right: [
        boolean('snap right upper', true, 'snap') ? 0 : undefined,
        boolean('snap right middle', true, 'snap') ? 0.5 : undefined,
        boolean('snap right lower', true, 'snap') ? 1 : undefined,
      ].filter((val) => val !== undefined) as number[],
      bottom: [
        boolean('snap bottom left', true, 'snap') ? 0 : undefined,
        boolean('snap bottom center', true, 'snap') ? 0.5 : undefined,
        boolean('snap bottom right', true, 'snap') ? 1 : undefined,
      ].filter((val) => val !== undefined) as number[],
      left: [
        boolean('snap left upper', true, 'snap') ? 0 : undefined,
        boolean('snap left middle', true, 'snap') ? 0.5 : undefined,
        boolean('snap left lower', true, 'snap') ? 1 : undefined,
      ].filter((val) => val !== undefined) as number[],
    }}
    disabled={{
      top: boolean('disable top region', false, 'disable'),
      right: boolean('disable right region', false, 'disable'),
      bottom: boolean('disable bottom region', false, 'disable'),
      left: boolean('disable left region', false, 'disable'),
    }}
    constrain={{
      top: boolean('constrain top boundary', true, 'constrain'),
      right: boolean('constrain right boundary', true, 'constrain'),
      bottom: boolean('constrain bottom boundary', true, 'constrain'),
      left: boolean('constrain left boundary', true, 'constrain'),
    }}
    sticky={boolean('sticky layout', true, 'behavior')}
  />
));
