/**
 * Creates an object composed of the picked object properties.
 *
 * @param {Object} object - The source object
 * @param {any[]} keys - The keys to pick
 * @returns {Object} - The new object
 */
const pick = (object: { [key: string]: any }, keys: string[]) => {
  return keys.reduce((obj: { [key: string]: any }, key: string) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export default pick;
