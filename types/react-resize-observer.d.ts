declare module 'react-resize-observer' {
  import * as React from 'react';
  type Props = {
    onResize?: (ClientRect: any) => unknown;
    onPosition?: (ClientRect: any) => unknown;
    onReflow?: (ClientRect: any) => unknown;
  };
  class ResizeObserver extends React.Component<Props> {
    static displayName: string;
    static addScrollListener(listener: (event: Event) => unknown): () => void;
    static addResizeListener(listener: (event: Event) => unknown): () => void;
  }
  export default ResizeObserver;
}
