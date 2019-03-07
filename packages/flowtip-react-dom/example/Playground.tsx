import * as React from 'react';

import Rect from 'flowtip-rect';
import flowtip, {Result, Region, getClampedTailPosition} from 'flowtip-core';

import Resizable, {Vec2} from './Resizable';

export interface Props {
  snap: {[key in Region]: number[]};
  disabled: {[key in Region]: boolean};
  constrain: {[key in Region]: boolean};
  sticky: boolean;
}

interface State {
  target: Rect;
  content: {width: number; height: number};
  bounds: Rect;
  result?: Result;
}

const rectPositionStyle = (rect: Rect): React.CSSProperties => {
  const {top, left, width, height} = Rect.abs(rect);
  return {top, left, width, height};
};

const Playground: React.StatelessComponent<Props> = ({
  snap,
  disabled,
  constrain,
  sticky,
}) => {
  const [active, setActive] = React.useState();
  const [focus, setFocus] = React.useState();
  const [dragging, setDragging] = React.useState();

  const [target, setTarget] = React.useState(new Rect(170, 205, 80, 30));
  const [content, setContent] = React.useState({width: 100, height: 50});
  const [bounds, setBounds] = React.useState(new Rect(10, 10, 400, 400));

  const lastResultRef = React.useRef<Result>();

  const result = flowtip({
    target,
    bounds,
    content,
    overlap: 10,
    offset: 10,
    edgeOffset: 10,
    region:
      sticky && lastResultRef.current
        ? lastResultRef.current.region
        : undefined,
    align:
      sticky && lastResultRef.current ? lastResultRef.current.align : undefined,
    snap,
    disabled,
    constrain,
  });

  React.useEffect(() => {
    lastResultRef.current = result;
  });

  const handleStart = () => setDragging(true);
  const handleEnd = () => setDragging(false);

  const handleSetActive = (active?: string) => () => setActive(active);
  const handleSetFocus = (focus?: string) => () => setFocus(focus);

  return (
    <div>
      <div
        style={{
          ...rectPositionStyle(bounds),
          position: 'absolute',
          outline: '1px solid black',
        }}
      />
      <div
        style={{
          ...rectPositionStyle(target),
          position: 'absolute',
          background: 'gray',
        }}
      />
      {result && (
        <div
          style={{
            ...rectPositionStyle(result.rect),
            position: 'absolute',
            background: '#666',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              [result.region]: '100%',
              [result.region === 'right' || result.region === 'left'
                ? 'top'
                : 'left']: getClampedTailPosition(
                result,
                {width: 10, height: 10},
                0,
              ),
              background: '#666',
            }}
          />
        </div>
      )}
      <Resizable
        active={active === 'bounds'}
        focused={!dragging && focus === 'bounds'}
        position={bounds}
        onChange={setBounds}
        onChangeStart={handleStart}
        onChangeEnd={handleEnd}
        onSetActive={handleSetActive('bounds')}
        onHover={handleSetFocus('bounds')}
        anchor={Vec2.zero}
      />
      {result && (
        <Resizable
          active={active === 'content'}
          focused={!dragging && focus === 'content'}
          position={result.rect}
          onChange={(rect: Rect) => {
            const {width, height} = Rect.abs(rect);
            setContent({width, height});
          }}
          onChangeStart={handleStart}
          onChangeEnd={handleEnd}
          onSetActive={handleSetActive('content')}
          onHover={handleSetFocus('content')}
          anchor={Vec2.zero}
        />
      )}
      <Resizable
        active={active === 'target'}
        focused={!dragging && focus === 'target'}
        position={target}
        onChange={setTarget}
        onChangeStart={handleStart}
        onChangeEnd={handleEnd}
        onSetActive={handleSetActive('target')}
        onHover={handleSetFocus('target')}
        anchor={Vec2.zero}
      />
    </div>
  );
};

export default React.memo(Playground);
