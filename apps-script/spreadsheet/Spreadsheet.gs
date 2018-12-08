Spreadsheet = {};
Spreadsheet.initialized = false;

Spreadsheet.init = function() {
  if (Spreadsheet.initialized) {
    return;
  }
  
  Cache.init();
  Spreadsheet.initialized = true;
  
  log(Log.Level.INFO, 'Spreadsheet.init()');
  
  Spreadsheet.ColumnDefinitions = function() {
    this.columnsInOrder = [];
  }
  
  Spreadsheet.ColumnDefinitions.prototype.addColumn(key, header) {
    this.columnsInOrder.push(header);
    this[key] = header;
    return this;
  }
  
  Spreadsheet.Sheet = function(sheet, columnDefinitions) {
      this.sheet = sheet;
      this.columns = new Spreadsheet.Columns(sheet, columnDefinitions);
      this.dataRange = this.sheet.getDataRange();
      this.rows = [];
      this.rowsById = null;
      this.cache = new Cache();
      this.cache.seed(this.dataRange.getValues(), this.dataRange.getFormulas());
    }
  
  Spreadsheet.Sheet.prototype.getSheetName = function() {
    return this.sheet.getSheetName();
  }
  
  Spreadsheet.Sheet.prototype.getSheetId = function() {
    return this.sheet.getSheetId();
  }
  
  Spreadsheet.Sheet.prototype.getDataRange = function() {
    return this.sheet.getDataRange();
  }
  
  Spreadsheet.Sheet.prototype.getUrl = function() {
    return '#gid=' + this.sheet.getSheetId();
  }
  
  Spreadsheet.Sheet.prototype.clearData = function() {
    log(Log.Level.INFO, 'clearData');
    if (this.sheet.getDataRange().getNumRows() <= 1) {
      log(Log.Level.INFO, 'Nothing to clear');
      return;
    }
    this.sheet.deleteRows(2, this.sheet.getDataRange().getNumRows() - 1);
    log(Log.Level.INFO, 'Cleared');
  }
  
  Spreadsheet.Sheet.prototype.getRow = function(rowOffset, opt_isNew) {
    return this.cache.getItem(rowOffset, function() {
      return new Spreadsheet.Row(
        function() { this.sheet.getDataRange().offset(rowOffset, 0, 1); }.bind(this),
        this.columns, this.cache.getRowCache(rowOffset),
          opt_isNew === true);
    }.bind(this));
  }
  
  Spreadsheet.Sheet.prototype.getRows = function() {
    var rows = [];
    for (var rowOffset = 1; rowOffset < this.getDataRange().getNumRows(); rowOffset++) {
      rows.push(this.getRow(rowOffset));
    }
    return rows;
  }
  
  Spreadsheet.Sheet.prototype.addRow = function() {
    var rows = this.getRows();
    var rowOffset = rows.length + 1;
    return this.getRow(rows.length + 1, true);
  }
  
  Spreadsheet.Sheet.prototype.removeRows = function(positions) {
    for (var i = 0; i < positions.length; i++) {
      positions[i] = parseInt(positions[i]);
    }
    positions.sort();
    for (var i = positions.length - 1; i >= 0; i--) {
      var position = positions[i];
      log(Log.Level.INFO, 'Removing row at position ' + position);
      this.sheet.deleteRow(position);
    }
    this.cache.clear();
  }
  
  Spreadsheet.Sheet.prototype.sortBy = function(columnHeader, opt_ascending) {
    var ascending = (opt_ascending === undefined) ? true : opt_ascending;
    var columnOffset = this.columns.getColumnOffset(columnHeader);
    this.sheet.sort(columnOffset + 1, ascending);
    this.cache.clear();
    return this;
  }
  
  // Spreadsheet.Columns
  
  Spreadsheet.Columns = function(sheet, columnDefinitions) {
    this.sheet = sheet;
    this.columnDefinitions = columnDefinitions;
    this.columns.createColumnsIfMissing(columnDefinitions);
    this.refreshHeaders();
  };
  
  Spreadsheet.Columns.prototype.createColumnIfMissing = function(columnName) {
    if (this.getColumnOffset(columnName) === undefined) {
      var dataRange = this.sheet.getDataRange();
      var headerCell = dataRange.offset(0, 0, 1, 1);
      if (headerCell.getValue() != '') {
        headerCell = dataRange.offset(0, dataRange.getNumColumns(), 1, 1);
      }
      headerCell.setValue(columnName);
      headerCell.setFontWeight('bold')
    }
  };
  
  Spreadsheet.Columns.prototype.createColumnsIfMissing = function(columnDefinitions) {
    columnDefinitions.columnNamesInOrder.forEach(function(columnName) { this.createColumnIfMissing(columnName); }.bind(this));
    this.sheet.setFrozenRows(1)
    this.refreshHeaders();
  };
  
  Spreadsheet.Columns.prototype.refreshHeaders = function() {
    var headerRow = this.sheet.getDataRange();
    this.headers = [];
    this.mapping = {};
    for (var columnOffset = 0; columnOffset < headerRow.getNumColumns(); columnOffset++) {
      var columnName = headerRow.offset(0, columnOffset, 1, 1).getValue();
      this.headers[columnOffset] = columnName;
      this.mapping[columnName] = columnOffset
    }
  };
  
  Spreadsheet.Columns.prototype.getColumnOffset = function(columnName) {
    if (!columnName in this.mapping) {
      throw new Error('Invalid column name: ' + columnName);
    }
    return this.mapping[columnName];
  };
  
  // Spreadsheet.Row
  
  Spreadsheet.Row = function(rowRangeCallback, columns, rowCache, isNew) {
    log(Log.Level.FINE, 'Creating Row object');
    this.rowRangeCallback = rowRangeCallback;
    this.rowRange = null;
    this.columns = columns;
    this.rowCache = rowCache;
    this.isNew = isNew;
  };
  
  Spreadsheet.Row.prototype.column_ = function(columnHeader) {
    log(Log.Level.FINE, 'column_(' + columnHeader + ')');
    return this.columns.getColumnOffset(columnHeader);
  };
  
  Spreadsheet.Row.prototype.getRowRange = function() {
    if (!this.rowRange) {
      log(Log.Level.FINE, 'Generating row range');
      this.rowRange = this.rowRangeCallback();
      log(Log.Level.FINE, 'Generated row range');
      if (this.rowRange.getNumRows() != 1) {
        throw 'Not a row: ' + range.getA1Notation();
      }
    }
    return this.rowRange;
  };
  
  Spreadsheet.Row.prototype.getCell = function(columnHeader) {
    log(Log.Level.FINE, 'getCell(' + columnHeader + ')');
    return this.getRowRange().offset(0, this.column_(columnHeader), 1, 1);
  };
  
  Spreadsheet.Row.prototype.getA1Notation = function(columnHeader) {
    return this.getCell(columnHeader).getA1Notation();
  };
  
  Spreadsheet.Row.prototype.getValue = function(columnHeader) {
    var value =  this.rowCache.getValue(this.column_(columnHeader), function() {
      return this.getCell(columnHeader).getValue();
    }.bind(this));
    log(Log.Level.FINER, 'Value for ' + columnHeader + ': ' + value);
    return value;
  };
  
  Spreadsheet.Row.prototype.getBooleanValue = function(columnHeader) {
    var val = this.getValue(columnHeader);
    return val.toUpperCase() === 'Y' || val.toUpperCase() === 'YES';
  };
  
  Spreadsheet.Row.prototype.setValue = function(columnHeader, val) {
    if (this.getValue(columnHeader) == val) {
      return;
    }
    this.getCell(columnHeader).setValue(val);
    this.rowCache.setValue(this.column_(columnHeader), val);
    return this;
  };
  
  Spreadsheet.Row.prototype.getFormula = function(columnHeader) {
    return this.rowCache.getFormula(columnHeader, function() {
      return this.getCell(columnHeader).getFormula();
    }.bind(this));
  };
  
  Spreadsheet.Row.prototype.setFormula = function(columnHeader, formula) {
    if (this.getFormula(columnHeader) == formula) {
      return;
    }
    this.getCell(columnHeader).setFormula(formula);
    this.rowCache.setFormula(this.column_(columnHeader), formula);
    return this;
  };
  
  Spreadsheet.Row.prototype.getRowNumber = function() {
    return this.getRowRange().getRow();
  };
  
  Spreadsheet.Row.prototype.getRowOffset = function() {
    return this.getRowNumber() - 1;
  };
  
  Spreadsheet.Row.prototype.setDataValidation = function(columnHeader, options) {
    var cell = this.getCell(columnHeader);
    var currDataValidation = cell.getDataValidation();
    if (currDataValidation) {
      var currentValues = currDataValidation.getCriteriaValues();
      if (currentValues.length > 0) {
        function arraysEqual(a1, a2) {
          if (a1.length != a2.length) {
            log(Log.Level.INFO, a1 + ' vs ' + a2);
            return false;
          }
          for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
              log(Log.Level.INFO, a1[i] + ' vs ' + a2[i]);
              return false;
            }
          }
          return true;
        }
        if (arraysEqual(options, currentValues[0])) {
          return;
        }
      }
    }
    cell.setDataValidation(SpreadsheetApp.newDataValidation().setAllowInvalid(false).requireValueInList(options).build());
  };
  
  
  Spreadsheet.getActiveSheetId = function() {
    log(Log.Level.FINER, 'getActiveSheetId');
    return SpreadsheetApp.getActiveSheet().getSheetId();
  };
  
  Spreadsheet.hyperlinkFormula = function(url, text) {
    return '=hyperlink("' + url + '", "' + text + '")'
  };
  
  Spreadsheet.getUrlFromHyperlinkFormula = function(formula) {
    return formula.substring(formula.indexOf('"') + 1, formula.lastIndexOf(',') - 1);
  };
}

