if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function(str) {
    return this.substring(0, str.length) === str;
  };
};

if (typeof String.prototype.includes != 'function') {
  String.prototype.includes = function(str) {
    return this.indexOf(str) >= 0;
  };
};

function typeOf(value) {
  var s = typeof value;
  if (s === 'object') {
    if (value) {
      if (value instanceof Array) {
        s = 'array';
      }
    } else {
      s = 'null';
    }
  }
  return s;
}

function indexMap(arr, fn) {
  var ret = {};
  for (var i = 0; i < arr.length; i++) {
    var e = arr[i];
    var key = fn(e);
    if (typeOf(key) == 'array') {
      key.forEach(function(k) { ret[k] = e; });
    } else {
      ret[key] = e;
    }
  }
  return ret;
}

function indexMultimap(arr, fn) {
  var ret = {};
  for (var i = 0; i < arr.length; i++) {
    var e = arr[i];
    var key = fn(e);
    if (ret[key] === undefined) {
      ret[key] = [];
    }
    if (typeOf(key) == 'array') {
      key.forEach(function(k) { ret[k].push(e); });
    } else {
      ret[key].push(e);
    }
  }
  return ret;
}