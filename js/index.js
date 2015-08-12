'use strict';

var Dygraph = require('dygraphs');
var calculatePercentile = require('./calculate-percentile.js');

var week = {};

var fetchData = function (dateString) {
  var dataURL = 'http://10.150.1.128:8695/http://viz.tokbox.com/reports/reportsdata/mobile_connection_latency/' + dateString;
  if (localStorage.hasOwnProperty(dateString)) {
    var item = JSON.parse(localStorage.getItem(dateString));
    return [new Date(item[0]), item[1], item[2]];
  }
  return fetch(dataURL).then(function (data) {
    return data.json();
  }).then(function (json) {
    if (json && json[0] && json[0].data && json[0].data[0]) {
      var data = json[0].data[0].data;
      var count = 0;
      var totalTime = 0;
      var values = [];
      Object.keys(data.frequency).forEach(function (key) {
        values.push(data.frequency[key]);
        count += data.frequency[key];
        totalTime += data.frequency[key] * data.time_interval[key];
      });
      var mean = totalTime / count;
      var median = calculatePercentile(values, 0.5);
      localStorage.setItem(dateString, JSON.stringify([dateString, mean, median]));
      return [new Date(dateString), mean, median];
    } else {
      localStorage.setItem(dateString, JSON.stringify([dateString, NaN, NaN]));
      return [new Date(dateString), NaN, NaN];
    }
  });
};

var toISOString = function (date) {
  return date.toISOString().substring(0, date.toISOString().indexOf('T'));
};

var getDates = function (currentDate, daysBack) {
  var dates = [toISOString(currentDate)];
  for (var i = 0; i < daysBack-1; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    dates.unshift(toISOString(currentDate));
  }
  return dates;
}

var dates = getDates(new Date('2015-08-10'), 10);

Promise.all(dates.map(function (dateString) {
  return fetchData(dateString);
})).then(function (data) {
  console.log(data);
  var g = new Dygraph(
    document.querySelector('.graph'),
    data,
    {
      labels: [ 'Date', 'Mean', 'Median' ]
    }
  );
});
