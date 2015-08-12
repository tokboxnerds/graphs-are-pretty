'use strict';

var assert = require('assert');

module.exports = function(arr, pc) {
  var total = arr.reduce(function(x, y) { return x + y; });
  var target = pc * total;

  var partialSum = 0;
  var index = 0;

  while (true) {
    partialSum += arr[index];

    if (partialSum >= target) {
      return index + (partialSum - target) / arr[index];
    }

    index++;
    assert(index < arr.length);
  }
};
