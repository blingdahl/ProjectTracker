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