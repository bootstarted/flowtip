import {addParameters, configure} from '@storybook/react';
import {themes} from '@storybook/theming';

addParameters({
  options: {
    theme: themes.dark,
  },
});

const context = require.context('../packages/', true, /.stories.tsx$/);

function loadStories() {
  context.keys().forEach((fileName) => context(fileName));
}

configure(loadStories, module);
