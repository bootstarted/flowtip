import * as React from 'react';

import Rect from 'flowtip-rect';
import flowtip, {Result, Region, getClampedTailPosition} from 'flowtip-core';

import LayoutObserver from '../src/LayoutObserver';

import Resizable from './Resizable';

export interface Props {
  snap: {[key in Region]: number[]};
  disabled: {[key in Region]: boolean};
  constrain: {[key in Region]: boolean};
  sticky: boolean;
}

const rectPositionStyle = (rect: Rect): React.CSSProperties => {
  const {top, left, width, height} = Rect.abs(rect);
  return {top, left, width, height};
};

const Playground = ({
  snap,
  disabled,
  constrain,
  sticky,
}: Props): React.ReactElement | null => {
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

  return (
    <LayoutObserver>
      {({anchor}) => (
        <>
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
                  background: '#555',
                }}
              />
            </div>
          )}
          <Resizable value={bounds} onChange={setBounds} anchor={anchor} />
          {result && (
            <Resizable
              value={result.rect}
              onChange={(rect: Rect) => {
                const {width, height} = Rect.abs(rect);
                setContent({width, height});
              }}
              handles={{
                nw: result.region === 'top' || result.region === 'left',
                n: result.region !== 'bottom',
                ne: result.region === 'top' || result.region === 'right',
                e: result.region !== 'left',
                se: result.region === 'bottom' || result.region === 'right',
                s: result.region !== 'top',
                sw: result.region === 'bottom' || result.region === 'left',
                w: result.region !== 'right',
              }}
              minWidth={10}
              minHeight={10}
              anchor={anchor}
            />
          )}
          <Resizable
            value={target}
            onChange={setTarget}
            anchor={anchor}
            minWidth={10}
            minHeight={10}
          />
        </>
      )}
    </LayoutObserver>
  );
};

export default React.memo(Playground);
