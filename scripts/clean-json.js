"use strict";
/*eslint-disable no-console */

var fs = require("fs");
var input = process.argv[2];

function deleteRecursive(data, key) {
  var keys = Array.isArray(key) ? key : [key];
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      if (keys.indexOf(property) > -1) {
        delete data[property];
      } else if (typeof data[property] === "object") {
        deleteRecursive(data[property], keys);
      }
    }
  }
}

function sortObject(obj) {
  if (typeof obj !== "object") return obj;
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    var tmp = [];
    obj.forEach(function (item) {
      tmp.push(sortObject(item));
    });
    return tmp;
  }

  var temp = {};
  var keys = [];

  Object.keys(obj).forEach(function (key) {
    keys.push(key);
  });

  keys.sort();
  for (var index = 0; index < keys.length; index++) {
    temp[keys[index]] = sortObject(obj[keys[index]]);
  }
  return temp;
}

var inputAsJson = JSON.parse(String(fs.readFileSync(input)));
var sorted = sortObject(inputAsJson);
deleteRecursive(sorted, ["from", "resolved"]);

console.log(JSON.stringify(sorted, null, 2));
