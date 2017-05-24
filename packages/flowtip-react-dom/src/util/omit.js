export default function omit(keys, object) {
  const result = {};

  for (const key in object) {
    if (object.hasOwnProperty(key) && keys.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }

  return result;
}
