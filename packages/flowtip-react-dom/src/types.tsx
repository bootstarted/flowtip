import * as React from 'react';
import {
  Rect,
  RectLike,
  Region,
  Align,
  Dimensions,
  Result as BaseResult,
} from 'flowtip-core';

// export type RectLike = RectLike;

export interface Result extends BaseResult {
  _static?: boolean;
}

export interface Borders {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface ContentProps {
  style: React.CSSProperties;
  result: Result;
  children: React.ReactNode;
}

export interface TailProps {
  result: Result;
}

export interface RenderProps {
  onContentSize(dimensions: Dimensions): unknown;
  onTailSize(dimensions: Dimensions): unknown;
  // eslint-disable-next-line no-use-before-define
  state: State;
  // eslint-disable-next-line no-use-before-define
  props: Props;
}

export type Render = (props: RenderProps) => React.ReactNode;

export interface Props {
  /** DOMRect (or similar shaped object) of target position. */
  target?: RectLike;
  /**
    DOMRect (or similar shaped object) of content boundary.
   */
  bounds?: RectLike;
  /** Default region the content should unless otherwise constrained. */
  region?: Region;
  /** Retain the previous rendered region unless otherwise constrained. */
  sticky: boolean;
  /** Offset between target rect and tail. */
  targetOffset: number;
  /** Minimum distance between content react and boundary edge. */
  edgeOffset?: number;
  /**
   * Prevent the tail from getting within this distance of the corner of
   * the content.
   */
  tailOffset: number;
  /** Relative alignment of content rect and target rect. */
  align: Align;
  /** Disable the top region. */
  topDisabled: boolean;
  /** Disable the right region. */
  rightDisabled: boolean;
  /** Disable the bottom region. */
  bottomDisabled: boolean;
  /** Disable the left region. */
  leftDisabled: boolean;
  /** Constrain the content at the top boundary. */
  constrainTop: boolean;
  /** Constrain the content at the top boundary. */
  constrainRight: boolean;
  /** Constrain the content at the right boundary. */
  constrainBottom: boolean;
  /** Constrain the content at the bottom boundary. */
  constrainLeft: boolean;
  children: React.ReactNode;

  render: Render;

  content?: React.ComponentType<ContentProps> | 'div';
  tail?: React.ComponentType<TailProps>;

  debug?: boolean;
}

export interface State {
  containingBlock: Rect;
  bounds?: Rect;
  content?: Dimensions;
  contentBorders?: Borders;
  tail?: Dimensions;
  result: Result;
  boundedByViewport?: boolean;
}
