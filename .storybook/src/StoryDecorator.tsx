import * as React from 'react';

import {ThemeProvider, createGlobalStyle} from './styled';
import StyleReset from './StyleReset';

const PageStyle = createGlobalStyle`
  body {
    font-family:
      apple-system,
      ".SFNSText-Regular",
      "San Francisco",
      BlinkMacSystemFont,
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "Lucida Grande",
      "Arial",
      sans-serif;
  }
`;

export interface StoryDecoratorProps {
  children?: React.ReactNode;
}

const StoryDecorator: React.StatelessComponent<StoryDecoratorProps> = ({
  children,
}) => (
  <ThemeProvider theme={{}}>
    <>
      <StyleReset />
      <PageStyle />
      {children}
    </>
  </ThemeProvider>
);

export default React.memo(StoryDecorator);
