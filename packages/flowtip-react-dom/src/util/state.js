// @flow

import {RIGHT, LEFT} from 'flowtip-core';
import type {Region} from 'flowtip-core';
import type {Props, State} from '../types';

/**
 * Get the last rendered region (`top`, `right`, `bottom`, or `left`).
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip state.
 * @returns {string} Region.
 */
export function getLastRegion(props: Props, state: State): Region | void {
  return state.result._static === true ? props.region : state.result.region;
}

/**
 * Get the current region (`top`, `right`, `bottom`, or `left`) that the FlowTip
 * layout algorithm should prioritize in it's result.
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip state.
 * @returns {string} Region.
 */
export function getRegion(props: Props, state: State): Region | void {
  // Feed the current region in as the default if `sticky` is true.
  // This makes the component stay in its region until it meets a
  // boundary edge and must change.
  return props.sticky ? getLastRegion(props, state) : props.region;
}

/**
 * Get the dimension of the tail perpendicular to the attached edge of the
 * content rect.
 *
 * Note: `props` are passed in as an argument to allow using this method from
 * within `componentWillReceiveProps`.
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip state.
 * @returns {number} Tail length.
 */
export function getTailLength(props: Props, state: State): number {
  const lastRegion = getLastRegion(props, state);

  if (state.tail) {
    // Swap the width and height into "base" and "length" to create
    // measurements that are agnostic to tail orientation.
    if (lastRegion === LEFT || lastRegion === RIGHT) {
      return state.tail.width;
    }
    // Either lastRegion is top or bottom - or it is undefined, which means
    // the tail was rendered using the static dummy result that uses the
    // bottom region.
    return state.tail.height;
  }

  return 0;
}

/**
 * Get the dimension of the tail parallel to the attached edge of the content
 * rect.
 *
 * Note: `props` are passed in as an argument to allow using this method from
 * within `componentWillReceiveProps`.
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip state.
 * @returns {number} Tail base size.
 */
export function getTailBase(props: Props, state: State): number {
  const lastRegion = getLastRegion(props, state);

  if (state.tail) {
    // Swap the width and height into "base" and "length" to create
    // measurements that are agnostic to tail orientation.
    if (lastRegion === LEFT || lastRegion === RIGHT) {
      return state.tail.height;
    }
    // Either lastRegion is top or bottom - or it is undefined, which means
    // the tail was rendered using the static dummy result that uses the
    // bottom region
    return state.tail.width;
  }

  return 0;
}

/**
 * Get current minimum linear overlap value.
 *
 * Overlap ensures that there is always enough room to render a tail that
 * points to the target rect. This will force the content to enter a
 * different region if there is not enough room. The `tailOffset` value
 * is the minimum distance between the tail and the content corner.
 *
 * Note: `props` are passed in as an argument to allow using this method from
 * within `componentWillReceiveProps`.
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip props.
 * @returns {number} Minimum linear overlap.
 */
export function getOverlap(props: Props, state: State): number {
  return props.tailOffset + getTailBase(props, state) / 2;
}

/**
 * Get the offset between the target and the content rect.
 *
 * The flowtip layout calculation does not factor the dimensions of the tail.
 * This method encodes the tail dimension into the `offset` parameter.
 *
 * Note: `props` are passed in as an argument to allow using this method from
 * within `componentWillReceiveProps`.
 *
 * @param   {Object} props - FlowTip props.
 * @param   {Object} state - FlowTip state.
 * @returns {number} Tail length.
 */
export function getOffset(props: Props, state: State): number {
  // Ensure that the there is `targetOffset` amount of space between the
  // tail and the target rect.
  return props.targetOffset + getTailLength(props, state);
}
