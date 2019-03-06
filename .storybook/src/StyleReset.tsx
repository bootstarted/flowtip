import {createGlobalStyle} from './styled';

const StyleReset = createGlobalStyle`
  a,
  abbr,
  acronym,
  address,
  applet,
  article,
  aside,
  audio,
  b,
  big,
  blockquote,
  body,
  canvas,
  caption,
  center,
  cite,
  code,
  dd,
  del,
  details,
  dfn,
  div,
  dl,
  dt,
  em,
  embed,
  fieldset,
  figcaption,
  figure,
  footer,
  form,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  hgroup,
  html,
  i,
  iframe,
  img,
  ins,
  kbd,
  label,
  legend,
  li,
  mark,
  menu,
  nav,
  object,
  ol,
  output,
  p,
  pre,
  q,
  ruby,
  s,
  samp,
  section,
  small,
  span,
  strike,
  strong,
  sub,
  summary,
  sup,
  table,
  tbody,
  td,
  tfoot,
  th,
  thead,
  time,
  tr,
  tt,
  u,
  ul,
  var,
  video {
    margin: 0;
    padding: 0;
    border: 0;
    font: inherit;
    vertical-align: baseline;
  }
  article,
  aside,
  canvas,
  figcaption,
  figure,
  footer,
  header,
  hgroup,
  main,
  output,
  section {
    display: block;
  }
  body {
    line-height: 1;
  }
  ol,
  ul {
    list-style: none;
  }
  blockquote,
  q {
    quotes: none;
    &::before,
    &::after {
      content: '';
      display: none;
    }
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  input,
  textarea,
  button,
  select {
    appearance: none;
    background: none;
    border-color: currentColor;
    border-style: none;
    border-width: medium;
    border-radius: 0;
    margin: 0;
    padding: 0;
    color: inherit;
    font-style: inherit;
    font-variant: inherit;
    font-weight: inherit;
    font-stretch: inherit;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    vertical-align: baseline;
  }
  ::placeholder: {
    opacity: 1;
    color: inherit;
    font-style: inherit;
    font-variant: inherit;
    font-weight: inherit;
    font-stretch: inherit;
    font-size: inherit;
    font-family: inherit;
  }
  a:link {
    text-decoration: none;
    backgroundcolor: transparent;
    -webkit-text-decoration-skip: objects;
  }
  a:link,
  a:visited,
  a:hover,
  a:active {
    color: inherit;
  }
  ::-webkit-inner-spin-button {
    appearance: none;
  }
  ::-webkit-outer-spin-button {
    appearance: none;
  }
  ::-webkit-search-cancel-button {
    appearance: none;
  }
  ::-webkit-search-results-button {
    appearance: none;
  }
  ::-ms-clear,
  ::-ms-reveal {
    display: none;
  }
  ::-webkit-contacts-auto-fill-button {
    display: none !important;
  }
  hr {
    boxsizing: content-box;
    height: 0;
    overflow: visible;
  }
  img {
    borderstyle: none;
  }
  svg:not(:root) {
    overflow: visible;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }
  input {
    -moz-appearance: textfield;
  }
  html {
    box-sizing: border-box;
    height: 100%;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  body {
    min-height: 100%;
  }
`;

export default StyleReset;
