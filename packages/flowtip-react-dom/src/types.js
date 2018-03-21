// @flow

import * as React from 'react';
import type {
  Rect,
  RectLike,
  Region,
  Align,
  Dimensions,
  Result,
} from 'flowtip-core';

export type Style = {[string]: string | number};

export type Borders = {
  top: number,
  left: number,
  right: number,
  bottom: number,
};

export type ContentProps = {
  style: Style,
  result: Result,
  children: React.Node,
};

export type TailProps = {
  style: Style,
  result: Result,
  children: React.Node,
};

export type RenderProps = {
  onContentSize(Dimensions): mixed,
  onTailSize(Dimensions): mixed,
  // eslint-disable-next-line no-use-before-define
  state: State,
  // eslint-disable-next-line no-use-before-define
  props: Props,
};

export type Render = (RenderProps) => React.Node;

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
  children: React.Node,

  render: Render,

  children: React.Node,

  content?: React.ComponentType<ContentProps> | string,
  tail?: ?React.ComponentType<TailProps>,
};

export type State = {
  containingBlock: Rect,
  bounds: Rect | null,
  content: Dimensions | null,
  contentBorders: Borders | null,
  tail: Dimensions | null,
  result: Result,
};
