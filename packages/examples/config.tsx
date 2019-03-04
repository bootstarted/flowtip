import {configure} from '@storybook/react';

const context = require.context('.', true, /.stories.tsx$/);

function loadStories() {
  context.keys().forEach((fileName) => context(fileName));
}

configure(loadStories, module);
