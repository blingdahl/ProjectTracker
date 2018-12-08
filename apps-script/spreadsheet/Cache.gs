Cache = {};
Cache.initialized = false;

Cache.init = function() {
  if (Cache.initialized) {
    return;
  }
  
  Cache.initialized = true;
  
  Cache.Row = function() {
    log(Log.Level.FINER, 'Creating cache');
    this.values = {};
    this.formulas = {};
  }
  
  Cache.Row.prototype.seed = function(values, formulas) {
    for (var i = 0; i < values.length; i++) {
      this.values[i] = values[i];
      this.formulas[i] = formulas[i];
    }
  };
  
  Cache.Row.prototype.setValue = function(columnOffset, value) {
    this.values[columnOffset] = value;
  };
  
  Cache.Row.prototype.getValue = function(columnOffset, fn) {
    if (!this.values[columnOffset]) {
      this.values[columnOffset] = fn();
    }
    return this.values[columnOffset];
  };
  
  Cache.Row.prototype.setFormula = function(columnOffset, formula) {
    this.formulas[columnOffset] = formula;
  };
  
  Cache.Row.prototype.getFormula = function(columnOffset, fn) {
    if (!this.formulas[columnOffset]) {
      this.formulas[columnOffset] = fn();
    }
    return this.formulas[columnOffset];
  };
  
  Cache.Row.prototype.clear = function() {
    this.values = [];
    this.formulas = [];
  };
  
  Cache.Sheet = function() {
    this.items = [];
    this.rowCaches = [];
  };
  
  Cache.Sheet.prototype.getRowCache = function(rowOffset) {
    log(Log.Level.FINEST, 'Getting row item at offset ' + rowOffset);
    if (!this.rowCaches[rowOffset]) {
      log(Log.Level.FINER, 'Creating row cache');
      this.rowCaches[rowOffset] = new Cache.Row();
    }
    return this.rowCaches[rowOffset];
  };
  
  Cache.Sheet.prototype.seed = function(values, formulas) {
    for (var rowOffset = 0; rowOffset < values.length; rowOffset++) {
      this.getRowCache(rowOffset).seed(values[rowOffset], formulas[rowOffset]);
    }
  };
  
  Cache.Sheet.prototype.getItem = function(rowOffset, fn) {
    log(Log.Level.FINEST, 'Getting item at offset ' + rowOffset);
    if (!this.items[rowOffset]) {
      log(Log.Level.FINER, 'Creating item');
      this.items[rowOffset] = fn();
    }
    return this.items[rowOffset];
  };
  
  Cache.Sheet.prototype.clear = function() {
    this.rowCaches.forEach(function(rowCache) { rowCache.clear() });
  };
}