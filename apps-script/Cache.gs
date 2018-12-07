Cache = {};
Cache.initialized = false;

Cache.init = function() {
  if (Cache.initialized) {
    return;
  }
  
  Cache.initialized = true;
  
  function RowCache() {
    log(Log.Level.FINER, 'Creating cache');
    this.values = {};
    this.formulas = {};
  }
  
  RowCache.prototype.seed = function(values, formulas) {
    for (var i = 0; i < values.length; i++) {
      this.values[i] = values[i];
      this.formulas[i] = formulas[i];
    }
  };
  
  RowCache.prototype.setValue = function(columnOffset, value) {
    this.values[columnOffset] = value;
  };
  
  RowCache.prototype.getValue = function(columnOffset, fn) {
    if (!this.values[columnOffset]) {
      this.values[columnOffset] = fn();
    }
    return this.values[columnOffset];
  };
  
  RowCache.prototype.setFormula = function(columnOffset, formula) {
    this.formulas[columnOffset] = formula;
  };
  
  RowCache.prototype.getFormula = function(columnOffset, fn) {
    if (!this.formulas[columnOffset]) {
      this.formulas[columnOffset] = fn();
    }
    return this.formulas[columnOffset];
  };
  
  RowCache.prototype.clear = function() {
    this.values = [];
    this.formulas = [];
  };
  
  function SheetCache () {
    this.items = [];
    this.rowCaches = [];
  };
  
  SheetCache.prototype.getRowCache = function(rowOffset) {
    log(Log.Level.FINEST, 'Getting row item at offset ' + rowOffset);
    if (!this.rowCaches[rowOffset]) {
      log(Log.Level.FINER, 'Creating row cache');
      this.rowCaches[rowOffset] = new RowCache();
    }
    return this.rowCaches[rowOffset];
  };
  
  SheetCache.prototype.seed = function(values, formulas) {
    for (var rowOffset = 0; rowOffset < values.length; rowOffset++) {
      this.getRowCache(rowOffset).seed(values[rowOffset], formulas[rowOffset]);
    }
  };
  
  SheetCache.prototype.getItem = function(rowOffset, fn) {
    log(Log.Level.FINEST, 'Getting item at offset ' + rowOffset);
    if (!this.items[rowOffset]) {
      log(Log.Level.FINER, 'Creating item');
      this.items[rowOffset] = fn();
    }
    return this.items[rowOffset];
  };
  
  SheetCache.prototype.clear = function() {
    this.rowCaches.forEach(function(rowCache) { rowCache.clear() });
  };
}