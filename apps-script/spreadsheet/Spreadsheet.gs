Spreadsheet = {};
Spreadsheet.initialized = false;

Spreadsheet.init = function() {
  if (Spreadsheet.initialized) {
    return;
  }
  
  Cache.init();
  Spreadsheet.initialized = true;
  
  Log.info('Spreadsheet.init()');
  
  Spreadsheet.ColumnDefinitions = function() {
    this.columnNamesInOrder = [];
  }
  
  Spreadsheet.ColumnDefinitions.prototype.addColumn = function(key, header) {
    this.columnNamesInOrder.push(header);
    this[key] = header;
    return this;
  }
  
  Spreadsheet.Sheet = function(nativeSheet, columnDefinitions) {
    this.nativeSheet = nativeSheet;
    this.columns = new Spreadsheet.Columns(nativeSheet, columnDefinitions);
    this.cache = new Cache.Sheet(this.getAllValues.bind(this), this.getAllFormulas.bind(this),
                                 this.getValuesForRow.bind(this), this.getFormulasForRow.bind(this));
  }
  
  Spreadsheet.Sheet.prototype.getSheetName = function() {
    return this.nativeSheet.getSheetName();
  }
  
  Spreadsheet.Sheet.prototype.getSheetId = function() {
    return this.nativeSheet.getSheetId();
  }
  
  Spreadsheet.Sheet.prototype.getDataRange = function() {
    return this.nativeSheet.getDataRange();
  }
  
  Spreadsheet.Sheet.prototype.setNumRows = function(rowsToKeep) {
    if (rowsToKeep < this.getAllRows().length) {
      this.nativeSheet.deleteRows(rowsToKeep, this.nativeSheet.getMaxRows() - rowsToKeep);
    } else if (rowsToKeep > this.getAllRows().length) {
      var currNumRows = this.getAllRows().length;
      for (var i = currNumRows + 1; i < rowsToKeep; i++) {
        this.nativeSheet.insertRowAfter(i);
      }
    }
  }
  
  Spreadsheet.Sheet.prototype.getUrl = function() {
    return '#gid=' + this.nativeSheet.getSheetId();
  }
  
  Spreadsheet.Sheet.prototype.getAllValues = function() {
    return this.getDataRange().getValues();
  }
  
  Spreadsheet.Sheet.prototype.getAllFormulas = function() {
    return this.getDataRange().getFormulas();
  }
  
  Spreadsheet.Sheet.prototype.getNativeRow = function(rowOffset) {
    return this.nativeSheet.getRange(rowOffset + 1, 1, 1, this.nativeSheet.getMaxColumns());
  }
  
  Spreadsheet.Sheet.prototype.getValuesForRow = function(rowOffset) {
    Log.info('getValuesForRow');
    Log.matrix(Log.Level.INFO, this.getNativeRow(rowOffset).getValues());
    return this.getNativeRow(rowOffset).getValues()[0];
  }
  
  Spreadsheet.Sheet.prototype.getFormulasForRow = function(rowOffset) {
    return this.getNativeRow(rowOffset).getFormulas()[0];
  }
  
  Spreadsheet.Sheet.prototype.clearData = function() {
    if (this.nativeSheet.getDataRange().getNumRows() <= 1) {
      Log.info('Nothing to clear');
      return;
    }
    this.nativeSheet.deleteRows(2, this.getDataRange().getNumRows() - 1);
    this.clearCache();
    Log.info('Cleared');
  }
  
  Spreadsheet.Sheet.prototype.createRowObject = function(nativeRow, columns, rowCache, opt_isNew) {
    return new Spreadsheet.Row(this, nativeRow, columns, rowCache, opt_isNew === true);
  }
  
  Spreadsheet.Sheet.prototype.getRow = function(rowOffset, opt_isNew) {
    return this.createRowObject(this.getNativeRow(rowOffset),
                                this.columns,
                                this.cache.getRowCache(rowOffset),
                                opt_isNew);
  }
  
  Spreadsheet.Sheet.prototype.getDataRows = function() {
    var rows = [];
    for (var rowOffset = 1; rowOffset < this.getDataRange().getNumRows(); rowOffset++) {
      rows.push(this.getRow(rowOffset));
    }
    return rows;
  }
  
  Spreadsheet.Sheet.prototype.getAllRows = function() {
    var rows = [];
    for (var rowOffset = 1; rowOffset < this.nativeSheet.getMaxRows(); rowOffset++) {
      rows.push(this.getRow(rowOffset));
    }
    return rows;
  }
  
  Spreadsheet.Sheet.prototype.addRow = function() {
    var rows = this.getDataRows();
    var rowOffset = rows.length + 1;
    return this.getRow(rows.length + 1, true);
  }
  
  Spreadsheet.Sheet.prototype.clearCache = function() {
    return this.cache.clear();
  }
  
  Spreadsheet.Sheet.prototype.removeRow = function(row) {
    this.nativeSheet.deleteRow(row.getRowNumber());
    this.clearCache();
  };
  
  Spreadsheet.Sheet.prototype.removeRowNumbers = function(rowNumbers) {
    rowNumbers.sort(function(a, b){return a - b});
    rowNumbers = rowNumbers.reverse();
    for (var i = 0; i < rowNumbers.length; i++) {
      this.nativeSheet.deleteRow(rowNumbers[i]);
    }
  }
  
  Spreadsheet.Sheet.prototype.getLastDataRowNumber = function() {
    return this.getDataRows().splice(-1)[0].getRowNumber();
  }
  
  Spreadsheet.Sheet.prototype.setNumBlankRows = function(blankRows) {
    this.setNumRows(this.getLastDataRowNumber() + blankRows);
  }
  
  Spreadsheet.Sheet.prototype.sortBy = function(columnHeader, opt_ascending) {
    var ascending = (opt_ascending === undefined) ? true : opt_ascending;
    var columnOffset = this.columns.getColumnOffset(columnHeader);
    this.nativeSheet.sort(columnOffset + 1, ascending);
    this.cache.clear();
    return this;
  };
  
  Spreadsheet.Sheet.prototype.toString = function() {
    return 'Spreadsheet.Sheet';
  };
  
  // Spreadsheet.Columns
  
  Spreadsheet.Columns = function(nativeSheet, columnDefinitions) {
    this.nativeSheet = nativeSheet;
    this.columnDefinitions = columnDefinitions;
    this.refreshHeaders();
    this.createColumnsIfMissing(columnDefinitions);
  };
  
  Spreadsheet.Columns.prototype.createColumnIfMissing = function(columnName) {
    if (this.getColumnOffset(columnName) === undefined) {
      var dataRange = this.nativeSheet.getDataRange();
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
    this.nativeSheet.setFrozenRows(1)
    this.refreshHeaders();
  };
  
  Spreadsheet.Columns.prototype.refreshHeaders = function() {
    var headerRow = this.nativeSheet.getDataRange();
    this.headers = [];
    this.mapping = {};
    for (var columnOffset = 0; columnOffset < headerRow.getNumColumns(); columnOffset++) {
      var columnName = headerRow.offset(0, columnOffset, 1, 1).getValue();
      this.headers[columnOffset] = columnName;
      this.mapping[columnName] = columnOffset
    }
  };
  
  Spreadsheet.Columns.prototype.getColumnOffset = function(columnName) {
    if (!columnName || !columnName in this.mapping) {
      throw new Error('Invalid column name: ' + columnName);
    }
    return this.mapping[columnName];
  };
  
  Spreadsheet.Columns.prototype.toString = function() {
    return 'Spreadsheet.Columns';
  };
  
  // Spreadsheet.Row
  
  Spreadsheet.Row = function(sheet, nativeRow, columns, rowCache, isNew) {
    if (!sheet) {
      throw new Error('No sheet');
    }
    if (!nativeRow) {
      throw new Error('No native row');
    }
    this.sheet = sheet;
    this.nativeRow = nativeRow;
    this.columns = columns;
    this.rowCache = rowCache;
    this.isNew = isNew;
  };
  
  Spreadsheet.Row.prototype.getNativeRow = function() {
    return this.nativeRow;
  };
  
  Spreadsheet.Row.prototype.getCell = function(columnHeader) {
    return this.getNativeRow().offset(0, this.columns.getColumnOffset(columnHeader), 1, 1);
  };
  
  Spreadsheet.Row.prototype.getA1Notation = function(columnHeader) {
    return this.getCell(columnHeader).getA1Notation();
  };
  
  Spreadsheet.Row.prototype.clearCache = function(columnHeader) {
    return this.rowCache.clear();
  };
  
  Spreadsheet.Row.prototype.getValue = function(columnHeader) {
    Log.info('columnHeader/offset=' + columnHeader + '/' + this.columns.getColumnOffset(columnHeader) + '=' + this.rowCache.getValue(this.columns.getColumnOffset(columnHeader)));
    return this.rowCache.getValue(this.columns.getColumnOffset(columnHeader));
  };
  
  Spreadsheet.Row.prototype.getBooleanValue = function(columnHeader) {
    var val = this.getValue(columnHeader);
    return val.toUpperCase() === 'Y' || val.toUpperCase() === 'YES';
  };
  
  Spreadsheet.Row.prototype.setValue = function(columnHeader, val) {
    if (this.getValue(columnHeader) == val) {
      return;
    }
    if (parseInt(val) != NaN) {
      // TODO(lindahl) Don't do this if the number format is already @
      this.getCell(columnHeader).setNumberFormat('@');
    }
    this.getCell(columnHeader).setValue(val);
    this.clearCache();
    return this;
  };
  
  Spreadsheet.Row.prototype.getFormula = function(columnHeader) {
    return this.rowCache.getFormula(this.columns.getColumnOffset(columnHeader));
  };
  
  Spreadsheet.Row.prototype.setFormula = function(columnHeader, formula) {
    if (this.getFormula(columnHeader) == formula) {
      return;
    }
    this.getCell(columnHeader).setFormula(formula);
    this.rowCache.clear();
    return this;
  };
  
  Spreadsheet.Row.prototype.getRowNumber = function() {
    return this.getNativeRow().getRow();
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
            Log.info(a1 + ' vs ' + a2);
            return false;
          }
          for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
              Log.info(a1[i] + ' vs ' + a2[i]);
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
  
  Spreadsheet.Row.prototype.toString = function() {
    return 'Spreadsheet.Row';
  };

  Spreadsheet.hyperlinkFormula = function(url, text) {
    return '=hyperlink("' + url + '", "' + text + '")'
  };
  
  Spreadsheet.getUrlFromHyperlinkFormula = function(formula) {
    return formula.substring(formula.indexOf('"') + 1, formula.lastIndexOf(',') - 1);
  };
  
  Spreadsheet.Spreadsheet = function(nativeSpreadsheet) {
    this.nativeSpreadsheet = nativeSpreadsheet;
  }
  
  Spreadsheet.Spreadsheet.prototype.getNativeSheets = function(sheetId) {
    return this.nativeSpreadsheet.getSheets();
  }
  
  Spreadsheet.Spreadsheet.prototype.getNativeSheet = function(sheetId) {
    var sheets = this.getNativeSheets();
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      if (sheet.getSheetId() == sheetId) {
        return sheet;
      }
    }
    throw new Error('Sheet not found: ' + sheetId);
  }
  
  Spreadsheet.SPREADSHEET_URL = null;
  
  Spreadsheet.setSpreadsheetUrl = function(spreadsheetUrl) {
    Spreadsheet.SPREADSHEET_URL = spreadsheetUrl;
  }
    
  Spreadsheet.getSpreadsheetUrl = function(opt_spreadsheetUrl) {
    var spreadsheetUrl = opt_spreadsheetUrl || Spreadsheet.SPREADSHEET_URL;
    if (!spreadsheetUrl && SpreadsheetApp.getActive()) {
      spreadsheetUrl = SpreadsheetApp.getActive().getUrl();
    }
    return spreadsheetUrl;
  }
    
  Spreadsheet.getSpreadsheet = function(opt_spreadsheetUrl) {
    var spreadsheetUrl = Spreadsheet.getSpreadsheetUrl(opt_spreadsheetUrl);
    return new Spreadsheet.Spreadsheet(SpreadsheetApp.openByUrl(spreadsheetUrl));
  }
}

function setSpreadsheetUrl(spreadsheetUrl) {
  Log.start('setSpreadsheetUrl', [spreadsheetUrl]);
  Preferences.init();
  Spreadsheet.init();
  Spreadsheet.getSpreadsheet(spreadsheetUrl);
  Preferences.setSpreadsheetUrl(spreadsheetUrl);
  Log.stop('setSpreadsheetUrl', [spreadsheetUrl]);
  return 'Set spreadsheet id';
}

function getSpreadsheetUrl() {
  Log.start('getSpreadsheetUrl', []);
  Preferences.init();
  var ret = Preferences.getSpreadsheetUrl();
  Log.stop('getSpreadsheetUrl', []);
  return ret;
}

function clearSpreadsheetUrl() {
  Log.start('clearSpreadsheetUrl', []);
  Preferences.init();
  Preferences.clearSpreadsheetUrl();
  Log.stop('clearSpreadsheetUrl', []);
}