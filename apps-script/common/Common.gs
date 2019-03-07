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

if (typeof String.prototype.toInitCaps != 'function') {
  String.prototype.toInitCaps = function() {
    var parts = this.split(' ');
    for (var i = 0; i < parts.length; i++) {
      parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }
    return parts.join(' ');
  };
};

if (typeof String.prototype.underscoreToCapsString != 'function') {
  String.prototype.underscoreToCapsString = function() {
    return this.toLowerCase().replace(/_/g, ' ').toInitCaps();
  };
};

if (typeof String.prototype.compare != 'function') {
  String.prototype.compare = function(str) {
    return this > str ? 1 : this === str ? 0 : -1;
  };
};


if (typeof String.prototype.padStart != 'function') {
  String.prototype.padStart = function(num, padChar) {
    var ret = this;
    for (var i = this.length; i < num; i++) {
      ret = padChar + ret;
    }
    return ret;
  };
};

function padStart(str, num, padChar) {
  var ret = String(str);
  for (var i = str.length; i < num; i++) {
    ret = padChar + ret;
  }
  return ret;
}

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

function toDateStr(d) {
  var monthStr = String(d.getMonth() + 1);
  if (monthStr.length === 1) {
    monthStr = '0' + monthStr;
  }
  var dayStr = String(d.getDate());
  if (dayStr.length === 1) {
    dayStr = '0' + dayStr;
  }
  return d.getYear() + '/' + monthStr + '/' + dayStr;
}

function getCurrDateStr() {
  return toDateStr(new Date());
}

function getNextDateStr() {
  return toDateStr(new Date());
}
