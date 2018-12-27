if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) === str;
  }
};

if (typeof String.prototype.includes != 'function') {
  String.prototype.includes = function(str) {
    return this.indexOf(str) >= 0;
  }
};

function map(arr, fn) {
  var ret = {};
  for (var i = 0; i < ret.length; i++) {
    var e = arr[i];
    ret[fn(e)] = e;
  }
  return ret;
}if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) === str;
  }
};

if (typeof String.prototype.includes != 'function') {
  String.prototype.includes = function(str) {
    return this.indexOf(str) >= 0;
  }
};

function map(arr, fn) {
  var ret = {};
  for (var i = 0; i < ret.length; i++) {
    var e = arr[i];
    ret[fn(e)] = e;
  }
  return ret;
}