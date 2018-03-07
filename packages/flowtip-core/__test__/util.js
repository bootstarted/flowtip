const scale = {x: 1, y: 0.5};

const lines = {
  light: {h: '─', v: '│', tl: '┌', tr: '┐', br: '┘', bl: '└'},
  heavy: {h: '━', v: '┃', tl: '┏', tr: '┓', br: '┛', bl: '┗'},
  dashed: {h: '┄', v: '┆', tl: '┌', tr: '┐', br: '┘', bl: '└'},
};

const tail = {
  top: '┸',
  left: '┥',
  bottom: '┰',
  right: '┝',
};

const draw = (canvas, x, y, c) => {
  if (x >= 0 && y >= 0) canvas[y][x] = c;
};

const drawScaled = (canvas, x, y, c) => {
  const _x = Math.round(x * scale.x);
  const _y = Math.round(y * scale.y);

  if (_x >= 0 && _y >= 0) canvas[_y][_x] = c;
};

const drawRect = (canvas = [], rect, style = 'light') => {
  const _top = Math.round(rect.top * scale.y);
  const _left = Math.round(rect.left * scale.x);
  const _bottom = Math.round(rect.top * scale.y + rect.height * scale.y);
  const _right = Math.round(rect.left * scale.x + rect.width * scale.x);
  const _height = Math.round(rect.height * scale.y);
  const _width = Math.round(rect.width * scale.x);

  for (let y = 0, yLen = _bottom; y <= yLen; y++) {
    canvas[y] = canvas[y] || [];
  }

  if (_height !== 0 && _width !== 0) {
    draw(canvas, _left, _top, lines[style].tl);
    draw(canvas, _right, _top, lines[style].tr);
    draw(canvas, _right, _bottom, lines[style].br);
    draw(canvas, _left, _bottom, lines[style].bl);

    for (let y = _top + 1; y < _bottom; y++) {
      draw(canvas, _left, y, lines[style].v);
      draw(canvas, _right, y, lines[style].v);
    }

    for (let x = _left + 1; x < _right; x++) {
      draw(canvas, x, _top, lines[style].h);
      draw(canvas, x, _bottom, lines[style].h);
    }
  } else if (_height === 0) {
    for (let x = _left; x <= _right; x++) {
      draw(canvas, x, _top, lines[style].h);
    }
  } else {
    for (let y = _top; y <= _bottom; y++) {
      draw(canvas, _left, y, lines[style].v);
    }
  }

  return canvas;
};

const printCanvas = (canvas) => {
  let result = '';

  for (let y = 0, yLen = canvas.length; y < yLen; y++) {
    for (let x = 0, xLen = canvas[y].length; x < xLen; x++) {
      result += canvas[y][x] || ' ';
    }

    result += '\n';
  }

  return result.slice(0, -1);
};

export const translateRect = (rect, left, top) => ({
  left: rect.left - left,
  top: rect.top - top,
  right: rect.right - left,
  bottom: rect.bottom - top,
  width: rect.width,
  height: rect.height,
});

export const drawResult = (config, result) => {
  const {bounds, target} = config;
  const {rect, region, reason, overlapCenter} = result;

  const top = Math.min(rect.top, bounds.top, target.top);
  const left = Math.min(rect.left, bounds.left, target.left);

  const _bounds = translateRect(bounds, left, top);
  const _target = translateRect(target, left, top);
  const _rect = translateRect(rect, left, top);
  const canvas = [];

  drawRect(canvas, _bounds, 'dashed');
  drawRect(canvas, _target, 'heavy');
  drawRect(canvas, _rect, 'light');

  if (region === 'bottom') {
    drawScaled(canvas, _rect.left + overlapCenter, _rect.top, tail.top);
  } else if (region === 'top') {
    drawScaled(canvas, _rect.left + overlapCenter, _rect.bottom, tail.bottom);
  } else if (region === 'left') {
    drawScaled(canvas, _rect.right, _rect.top + overlapCenter, tail.right);
  } else if (region === 'right') {
    drawScaled(canvas, _rect.left, _rect.top + overlapCenter, tail.left);
  }

  const printed = printCanvas(canvas)
    .split('\n')
    .join(`\n${region[0]}  `);

  return `
  ${reason}
  ${region}

${region[0]}  ${printed}
  `;
};
