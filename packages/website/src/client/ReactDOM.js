// @flow

// Import modules ==============================================================
import _ReactDOM from 'react-dom';

// Temp fix for https://github.com/facebook/flow/issues/5035
const ReactDOM: {
  ...typeof _ReactDOM,
  hydrate<ElementType: React$ElementType>(
    element: React$Element<ElementType>,
    container: Element,
    callback?: () => void,
  ): React$ElementRef<ElementType>,
  // flowlint unclear-type: off
} = (_ReactDOM: any);
// flowlint unclear-type: error

export default ReactDOM;
