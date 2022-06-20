export const remove = (arr, predicate) => {
  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];

    if (predicate(item)) return arr.splice(i, 1)[0];
  }
};

export const removeAll = (arr, predicate) => {
  const deletedItems = [];

  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];

    if (predicate(item)) deletedItems.unshift(arr.splice(i, 1)[0]);
  }

  return deletedItems;
};

/**
 * Remove items from array optimized
 *
 * @param {Array} arr array that contains needed removing items
 * @param {Function} predicate callback to check condition to remove
 * @param {Number} count number of items need to remove
 */
export const countingRemove = (arr, predicate, count = 0) => {
  const deletedItems = [];
  if (count <= 0) return deletedItems;

  for (let i = arr.length - 1; i >= 0; i--) {
    const item = arr[i];

    if (predicate(item)) {
      deletedItems.unshift(arr.splice(i, 1)[0]);
      if (--count <= 0) return deletedItems;
    }
  }

  return deletedItems;
};

export const chunk = (items, itemsPerRow) => {
  const groups = [];

  for (let i = 0, len = items.length; i < len; i++) {
    const groupIndex = Math.floor(i / itemsPerRow);
    const itemIndex = i % itemsPerRow;

    if (itemIndex === 0) groups[groupIndex] = [];

    groups[groupIndex].push(items[i]);
  }

  return groups;
};

export const distinct = (items) => {
  return items.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
};

/**
 * to dictionary
 * @param {Array.<{ id: String|Number }>} items
 */
export const toMap = (items) => {
  const result = {};

  for (let i = 0, len = items.length; i < len; i += 1) {
    result[items[i].id] = items[i];
  }

  return result;
};
