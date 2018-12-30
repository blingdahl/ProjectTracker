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

function indexMap(arr, fn) {
  var ret = {};
  for (var i = 0; i < arr.length; i++) {
    var e = arr[i];
    var key = fn(e);
    ret[key] = e;
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
    ret[key].push(e);
  }
  return ret;
}