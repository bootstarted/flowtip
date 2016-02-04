module.exports = {
  pick(object, keysArray) {
    const reduced = keysArray.reduce(function(acc, val) {
      if (object[val] !== undefined) { // eslint-disable-line no-undefined
        acc[val] = object[val];
      }
      return acc
    }, {});

    return reduced
  },

  extend(destination, ...sources) {
    const result = destination;
    sources.forEach((source) => {
      let keys = Object.keys(source);
      keys.forEach((key => {
        result[key] = source[key];
      }));
    });
    return result;
  }
}
