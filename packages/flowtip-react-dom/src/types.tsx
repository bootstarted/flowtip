import * as React from 'react';
import {Rect, RectLike, Region, Align, Dimensions, Result} from 'flowtip-core';

export type Borders = {
  top: number,
  left: number,
  right: number,
  bottom: number,
};

export type ContentProps = {
  style: React.CSSProperties,
  result: Result,
  children: React.ReactNode,
};

export type TailProps = {
  style: React.CSSProperties,
  result: Result,
  children: React.ReactNode,
};

export type RenderProps = {
  onContentSize(Dimensions): unknown,
  onTailSize(Dimensions): unknown,
  // eslint-disable-next-line no-use-before-define
  state: State,
  // eslint-disable-next-line no-use-before-define
  props: Props,
};

export type Render = (RenderProps) => React.ReactNode;

export type Props = {
  /** DOMRect (or similar shaped object) of target position. */
  target: RectLike | null,
  /**
    DOMRect (or similar shaped object) of content boundary.
   */
  bounds: RectLike | null,
  /** Default region the content should unless otherwise constrained. */
  region: Region | void,
  /** Retain the previous rendered region unless otherwise constrained. */
  sticky: boolean,
  /** Offset between target rect and tail. */
  targetOffset: number,
  /** Minimum distance between content react and boundary edge. */
  edgeOffset?: number,
  /**
   * Prevent the tail from getting within this distance of the corner of
   * the content.
   */
  tailOffset: number,
  /** Relative alignment of content rect and target rect. */
  align: Align,
  /** Disable the top region. */
  topDisabled: boolean,
  /** Disable the right region. */
  rightDisabled: boolean,
  /** Disable the bottom region. */
  bottomDisabled: boolean,
  /** Disable the left region. */
  leftDisabled: boolean,
  /** Constrain the content at the top boundary. */
  constrainTop: boolean,
  /** Constrain the content at the top boundary. */
  constrainRight: boolean,
  /** Constrain the content at the right boundary. */
  constrainBottom: boolean,
  /** Constrain the content at the bottom boundary. */
  constrainLeft: boolean,
  children: React.ReactNode,

  render: Render,

  content?: React.ComponentType<ContentProps> | 'div',
  tail?: React.ComponentType<TailProps>,
};

export type State = {
  containingBlock: Rect,
  bounds: Rect | null,
  content: Dimensions | null,
  contentBorders: Borders | null,
  tail: Dimensions | null,
  result: Result,
  boundedByViewport: boolean | null,
};
