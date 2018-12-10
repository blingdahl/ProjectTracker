Cache = {};
Cache.initialized = false;

Cache.init = function() {
  if (Cache.initialized) {
    return;
  }
  
  Cache.initialized = true;
  
  Cache.Sheet = function(fetchAllValuesFn, fetchAllFormulasFn, fetchRowValuesFn, fetchRowFormulasFn) {
    this.values = null;
    this.formulas = null;
    this.fetchAllValuesFn = fetchAllValuesFn;
    this.fetchAllFormulasFn = fetchAllFormulasFn;
    this.fetchRowValuesFn = fetchRowValuesFn;
    this.fetchRowFormulasFn = fetchRowFormulasFn;
  };
  
  Cache.Sheet.prototype.precache = function() {
    this.values = this.fetchAllValuesFn();
    this.formulas = this.fetchAllFormulasFn();
  }
  
  Cache.Sheet.prototype.getValue = function(rowOffset, columnOffset) {
    if (this.values === null) {
      this.values = [];
    }
    if (this.values[rowOffset] === undefined) {
      this.values[rowOffset] = this.fetchRowValuesFn(rowOffset);
    }
    return this.values[rowOffset][columnOffset] || '';
  };
  
  Cache.Sheet.prototype.getFormula = function(rowOffset, columnOffset) {
    if (this.formulas === null) {
      this.formulas = [];
    }
    if (this.formulas[rowOffset] === undefined) {
      this.formulas[rowOffset] = this.fetchRowFormulasFn(rowOffset);
    }
    return this.formulas[rowOffset][columnOffset] || '';
  };
  
  Cache.Sheet.prototype.clearRow = function(rowOffset) {
    if (this.values) {
      this.values[rowOffset] = undefined;
    }
    if (this.formulas) {
      this.formulas[rowOffset] = undefined;
    }
  }
  
  Cache.Sheet.prototype.getRowCache = function(rowOffset) {
    return new Cache.Row(
      function(columnOffset) { return this.getValue(rowOffset, columnOffset); }.bind(this),
      function(columnOffset) { return this.getFormula(rowOffset, columnOffset); }.bind(this),
        function() { this.clearRow(rowOffset); }.bind(this));
  };
  
  Cache.Sheet.prototype.clear = function() {
    this.values = null;
    this.formulas = null;
  };
  
  Cache.Sheet.prototype.getRowOffsetsForColumnValue = function(columnOffset, value) {
    this.precache();
    var ret = [];
    for (var rowOffset = 0; rowOffset < this.values.length; rowOffset++) {
      if (this.values[rowOffset][columnOffset] === value) {
        ret.push(rowOffset);
      }
    }
    return ret;
  };
  
  Cache.Sheet.prototype.toString = function() {
    return 'Cache.Sheet';
  };
  
  Cache.Row = function(getValueFn, getFormulaFn, clearFn) {
    this.getValueFn = getValueFn;
    this.getFormulaFn = getFormulaFn;
    this.clearFn = clearFn;
  }
  
  Cache.Row.prototype.getValue = function(columnOffset) {
    return this.getValueFn(columnOffset);
  }
  
  Cache.Row.prototype.getFormula = function(columnOffset) {
    return this.getFormulaFn(columnOffset);
  }
  
  Cache.Row.prototype.clear = function() {
    return this.clearFn();
  }
  
  Cache.Row.prototype.toString = function() {
    return 'Cache.Row';
  }
}