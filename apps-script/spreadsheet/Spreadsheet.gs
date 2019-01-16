Spreadsheet = {};
Spreadsheet.initialized = false;

Spreadsheet.init = function() {
  if (Spreadsheet.initialized) {
    return;
  }
  
  Cache.init();
  Spreadsheet.initialized = true;
  Log.info('Spreadsheet.init()');
  
  Spreadsheet.ColumnDefinition = function(key, header) {
    this.key = key;
    this.header = header;
  }
  
  Spreadsheet.ColumnDefinitions = function() {
    this.columnDefinitionsInOrder = [];
  }
  
  Spreadsheet.ColumnDefinitions.prototype.addColumn = function(key, header) {
    this.columnDefinitionsInOrder.push(new Spreadsheet.ColumnDefinition(key, header));
    this[key] = header;
    return this;
  }
  
  Spreadsheet.Sheet = function(nativeSheet, columnDefinitions) {
    this.nativeSheet = nativeSheet;
    this.sheetId = nativeSheet.getSheetId();
    this.columns = new Spreadsheet.Columns(this, columnDefinitions);
    this.cache = new Cache.Sheet(this.getAllValues.bind(this), this.getAllFormulas.bind(this),
                                 this.getValuesForRow.bind(this), this.getFormulasForRow.bind(this));
    this.dirty = true;
    this.columns.init();
  }
  
  Spreadsheet.Sheet.prototype.getSheetName = function() {
    return this.nativeSheet.getSheetName();
  }
  
  Spreadsheet.Sheet.prototype.getSheetId = function() {
    return this.sheetId;
  }
  
  Spreadsheet.Sheet.prototype.loadDataIfDirty = function() {
    if (this.dirty || !this.dataRange || !this.maxColumns) {
      this.dataRange = this.nativeSheet.getDataRange();
      this.maxColumns = this.nativeSheet.getMaxColumns();
      this.dirty = false;
    }
  }
  
  Spreadsheet.Sheet.prototype.getDataRange = function() {
    this.loadDataIfDirty();
    return this.dataRange;
  }
  
  Spreadsheet.Sheet.prototype.getMaxColumns_ = function(rowOffset) {
    this.loadDataIfDirty();
    return this.maxColumns;
  }
  
  Spreadsheet.Sheet.prototype.markDirty = function() {
    this.dirty = true;
    this.clearCache();
    Log.info('Marked dirty');
  }
  
  Spreadsheet.Sheet.prototype.clearCache = function() {
    return this.cache.clear();
  }
  
  Spreadsheet.Sheet.prototype.clearData = function() {
    if (this.nativeSheet.getDataRange().getNumRows() <= 1) {
      Log.info('Nothing to clear');
      return;
    }
    this.nativeSheet.deleteRows(2, this.getDataRange().getNumRows() - 1);
    this.markDirty();
    Log.info('Cleared');
  }
  
  Spreadsheet.Sheet.prototype.setNumRows = function(rowsToKeep) {
    var numDataRowsWithBlanks = this.getNumDataRows(true);
    if (rowsToKeep < numDataRowsWithBlanks) {
      this.markDirty();
      this.nativeSheet.deleteRows(rowsToKeep, this.nativeSheet.getMaxRows() - rowsToKeep);
    } else if (rowsToKeep > numDataRowsWithBlanks) {
      this.markDirty();
      for (var i = numDataRowsWithBlanks + 1; i < rowsToKeep; i++) {
        this.nativeSheet.insertRowAfter(i);
      }
    }
  }
  
  Spreadsheet.Sheet.prototype.addRow = function() {
    this.markDirty();
    var rows = this.getDataRows();
    var rowOffset = rows.length + 1;
    return this.getRow(rowOffset, true);
  }
  
  Spreadsheet.Sheet.prototype.removeRow = function(row) {
    this.markDirty();
    this.nativeSheet.deleteRow(row.getRowNumber());
  };
  
  Spreadsheet.Sheet.prototype.removeRowNumbers = function(rowNumbers) {
    this.markDirty();
    rowNumbers.sort(function(a, b){return a - b});
    rowNumbers = rowNumbers.reverse();
    for (var i = 0; i < rowNumbers.length; i++) {
      this.nativeSheet.deleteRow(rowNumbers[i]);
    }
  }
  
  Spreadsheet.Sheet.prototype.setNumBlankRows = function(blankRows) {
    this.setNumRows(this.getLastDataRowNumber() + blankRows);
  }
  
  Spreadsheet.Sheet.prototype.resetColumnOrder = function() {
    this.markDirty();
    this.columns.resetColumnOrder();
    return this;
  };
  
  Spreadsheet.Sheet.prototype.sortBy = function(columnHeader, opt_ascending) {
    this.markDirty();
    var ascending = (opt_ascending === undefined) ? true : opt_ascending;
    var columnOffset = this.columns.getColumnOffset(columnHeader);
    this.nativeSheet.sort(columnOffset + 1, ascending);
    return this;
  };
  
  Spreadsheet.Sheet.prototype.getUrl = function() {
    return '#gid=' + this.nativeSheet.getSheetId();
  }
  
  Spreadsheet.Sheet.prototype.getAllValues = function() {
    return this.getDataRange().getValues();
  }
  
  Spreadsheet.Sheet.prototype.getAllFormulas = function() {
    return this.getDataRange().getFormulas();
  }
  
  Spreadsheet.Sheet.prototype.getNativeRow_ = function(rowOffset) {
    return this.nativeSheet.getRange(rowOffset + 1, 1, 1, this.getMaxColumns_());
  }
  
  Spreadsheet.Sheet.prototype.getValuesForRow = function(rowOffset) {
    return this.getNativeRow_(rowOffset).getValues()[0];
  }
  
  Spreadsheet.Sheet.prototype.getFormulasForRow = function(rowOffset) {
    return this.getNativeRow_(rowOffset).getFormulas()[0];
  }
  
  Spreadsheet.Sheet.prototype.createRowObject = function(nativeRow, columns, rowCache, opt_isNew) {
    return new Spreadsheet.Row(this, nativeRow, columns, rowCache, opt_isNew === true);
  }
  
  Spreadsheet.Sheet.prototype.getRow = function(rowOffset, opt_isNew) {
    var row = this.createRowObject(this.getNativeRow_(rowOffset),
                                   this.columns,
                                   this.cache.getRowCache(rowOffset),
                                   opt_isNew);
    return row;
  }
  
  Spreadsheet.Sheet.prototype.getDataRow = function(rowOffset, opt_isNew) {
    return this.getRow(rowOffset + 1, opt_isNew);
  }
  
  Spreadsheet.Sheet.prototype.getNumDataRows = function(opt_includeBlank) {
    return opt_includeBlank ? this.nativeSheet.getMaxRows() - 1 : this.getDataRange().getNumRows() - 1;
  }
  
  Spreadsheet.Sheet.prototype.getDataRows = function(opt_includeBlank) {
    var rows = [];
    var numDataRows = this.getNumDataRows(opt_includeBlank);
    for (var rowOffset = 0; rowOffset < numDataRows; rowOffset++) {
      rows.push(this.getDataRow(rowOffset));
    }
    return rows;
  }
  
  Spreadsheet.Sheet.prototype.getLastDataRowNumber = function() {
    var lastRow = this.getDataRows().splice(-1)[0];
    if (lastRow) {
      return lastRow.getRowNumber();
    } 
    return 0;
  }
  
  Spreadsheet.Sheet.prototype.resizeColumnToFit = function(columnHeader) {
    this.nativeSheet.autoResizeColumn(this.columns.getColumnOffset(columnHeader) + 1);
    return this;
  };
  
  Spreadsheet.Sheet.prototype.hideColumn = function(columnHeader) {
    this.columns.hideColumn(columnHeader);
    return this;
  };
  
  Spreadsheet.Sheet.prototype.setFrozenColumns = function(numColumns) {
    this.nativeSheet.setFrozenColumns(numColumns);
    return this;
  };
  
  Spreadsheet.Sheet.prototype.setFrozenRows = function(numRows) {
    this.nativeSheet.setFrozenRows(numRows);
    return this;
  };
  
  Spreadsheet.Sheet.prototype.getRowsForRange = function(range) {
    var rows = [];
    for (var rowNumber = range.getRow(); rowNumber < range.getRow() + range.getNumRows(); rowNumber++) {
      var row = this.getRow(rowNumber - 1);
      rows.push(row);
    }
    return rows;
  }
  
  Spreadsheet.Sheet.prototype.getActiveRows = function() {
    return this.getRowsForRange(SpreadsheetApp.getActiveRange());
  };
  
  Spreadsheet.Sheet.prototype.getRowsForA1Notation = function(a1Notation) {
    return this.getRowsForRange(this.nativeSheet.getRange(a1Notation));
  }
  
  Spreadsheet.Sheet.prototype.toString = function() {
    return 'Spreadsheet.Sheet';
  };
  
  // Spreadsheet.Columns
  
  Spreadsheet.Columns = function(sheet, columnDefinitions) {
    this.sheet = sheet;
    this.columnDefinitions = columnDefinitions;
  };
  
  Spreadsheet.Columns.prototype.init = function() {
    this.refreshHeaders();
    this.createColumnsIfMissing(this.columnDefinitions);
  }
  
  Spreadsheet.Columns.prototype.createColumnIfMissing = function(columnHeader) {
    if (this.getColumnOffset(columnHeader) === undefined) {
      var dataRange = this.sheet.getDataRange();
      var headerCell = dataRange.offset(0, 0, 1, 1);
      if (headerCell.getValue() != '') {
        headerCell = dataRange.offset(0, dataRange.getNumColumns(), 1, 1);
      }
      headerCell.setValue(columnHeader);
      headerCell.setFontWeight('bold')
      this.refreshHeaders();
    }
  };
  
  Spreadsheet.Columns.prototype.createColumnsIfMissing = function(columnDefinitions) {
    columnDefinitions.columnDefinitionsInOrder.forEach(function(columnDefinition) {
      this.createColumnIfMissing(columnDefinition.header);
    }.bind(this));
    this.sheet.setFrozenRows(1)
    this.refreshHeaders();
  };
  
  Spreadsheet.Columns.prototype.getHeaderRange = function(columnHeader) {
    return this.getHeaderRangeForColumnOffset(this.getColumnOffset(columnHeader));
  };
  
  Spreadsheet.Columns.prototype.getHeaderRangeForColumnOffset = function(columnOffset) {
    return this.sheet.getDataRange().offset(0, columnOffset, 1, 1);
  };
  
  Spreadsheet.Columns.prototype.moveColumn = function(columnHeader, newPosition) {
    var headerRange = this.getHeaderRange(columnHeader);
    if (headerRange.getColumn() != newPosition) {
      this.sheet.nativeSheet.moveColumns(this.getHeaderRange(columnHeader), newPosition);
      this.refreshHeaders();
    }
    return this;
  };
  
  Spreadsheet.Columns.prototype.resetColumnOrder = function() {
    for (var i = 0; i < this.columnDefinitions.columnDefinitionsInOrder.length; i++) {
      this.moveColumn(this.columnDefinitions.columnDefinitionsInOrder[i].header, i + 1);
    }
    return this;
  };
  
  Spreadsheet.Columns.prototype.hideColumn = function(columnHeader) {
    this.sheet.nativeSheet.hideColumn(this.getHeaderRange(columnHeader));
    return this;
  };
  
  Spreadsheet.Columns.prototype.refreshHeaders = function() {
    Log.info('refreshHeaders');
    this.sheet.markDirty();
    var numColumns = this.sheet.getDataRange().getNumColumns();
    this.headers = [];
    this.mapping = {};
    for (var columnOffset = 0; columnOffset < numColumns; columnOffset++) {
      var columnHeader = this.getHeaderRangeForColumnOffset(columnOffset).getValue();
      this.headers[columnOffset] = columnHeader;
      this.mapping[columnHeader] = columnOffset
    }
  };
  
  Spreadsheet.Columns.prototype.getColumnOffset = function(columnHeader) {
    if (!columnHeader || !columnHeader in this.mapping) {
      throw new Error('Invalid column name: ' + columnHeader);
    }
    return this.mapping[columnHeader];
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
  
  Spreadsheet.Row.prototype.setValue = function(columnHeader, val) {
    if (this.getValue(columnHeader) == val) {
      return;
    }
    this.sheet.markDirty();
    if (parseInt(val) != NaN) {
      // TODO(lindahl) Don't do this if the number format is already @
      this.getCell_(columnHeader).setNumberFormat('@');
    }
    this.getCell_(columnHeader).setValue(val);
    return this;
  };
  
  Spreadsheet.Row.prototype.setFormula = function(columnHeader, formula) {
    if (this.getFormula(columnHeader) == formula) {
      return;
    }
    this.sheet.markDirty();
    this.getCell_(columnHeader).setFormula(formula);
    return this;
  };
  
  Spreadsheet.Row.prototype.setDataValidation = function(columnHeader, options) {
    // Don't need to mark dirty, didn't change the data
    var cell = this.getCell_(columnHeader);
    var currDataValidation = cell.getDataValidation();
    if (currDataValidation) {
      var currentValues = currDataValidation.getCriteriaValues();
      if (currentValues.length > 0) {
        function arraysEqual(a1, a2) {
          if (a1.length != a2.length) {
            return false;
          }
          for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i]) {
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
  
  Spreadsheet.Row.prototype.removeDataValidation = function(columnHeader, options) {
    // Don't need to mark dirty, didn't change the data
    var cell = this.getCell_(columnHeader);
    // cell = SpreadsheetApp.getActiveRange()
    cell.clearDataValidations();
  };
  
  Spreadsheet.Row.prototype.getCell_ = function(columnHeader) {
    return this.nativeRow.offset(0, this.columns.getColumnOffset(columnHeader), 1, 1);
  };
  
  Spreadsheet.Row.prototype.getA1Notation = function(opt_columnHeader) {
    if (opt_columnHeader) {
      return this.getCell_(opt_columnHeader).getA1Notation();
    } else {
      return this.nativeRow.getA1Notation();
    }
  };
  
  Spreadsheet.Row.prototype.clearCache = function(columnHeader) {
    return this.rowCache.clear();
  };
  Spreadsheet.Row.prototype.getValue = function(columnHeader, opt_includeMerged) {
    var ret = this.rowCache.getValue(this.columns.getColumnOffset(columnHeader));
    if (ret) {
      return ret;
    }
    if (opt_includeMerged) {
      // TODO(lindahl) Only include merged for columns that are merged
      var mergedRows = this.getMergedRows();
      for (var i = 0; i < mergedRows.length && !ret; i++) {
        return mergedRows[i].getValue(columnHeader);
      }
    }
    return '';
  };
  
  Spreadsheet.Row.prototype.getBooleanValue = function(columnHeader) {
    var val = this.getValue(columnHeader);
    return val.toUpperCase() === 'Y' || val.toUpperCase() === 'YES';
  };
  
  Spreadsheet.Row.prototype.getFormula = function(columnHeader) {
    return this.rowCache.getFormula(this.columns.getColumnOffset(columnHeader));
  };
  
  Spreadsheet.Row.prototype.getLinkUrl = function(columnHeader) {
    return Spreadsheet.getUrlFromHyperlinkFormula(this.getFormula(columnHeader));
  };
  
  Spreadsheet.Row.prototype.getRowNumber = function() {
    return this.nativeRow.getRow();
  };
  
  Spreadsheet.Row.prototype.getRowOffset = function() {
    return this.getRowNumber() - 1;
  };
  
  Spreadsheet.Row.prototype.getMergedRows = function() {
    var mergedRanges = this.nativeRow.getMergedRanges();
    var mergedRowIndicesSet = {};
    for (var i = 0; i < mergedRanges.length; i++) {
      mergedRowIndicesSet[mergedRanges[i].getRow() - 1] = true;
    }
    var mergedRows = [];
    var mergedRowIndices = Object.keys(mergedRowIndicesSet);
    for (var i = 0; i < mergedRowIndices.length; i++) {
      var rowIndex = parseInt(mergedRowIndices[i]);
      var mergedRow = this.sheet.getRow(rowIndex);
      mergedRows.push(mergedRow);
    }
    return mergedRows;
  };
  
  Spreadsheet.Row.prototype.split = function(mergedColumns) {
    this.sheet.nativeSheet.insertRowAfter(this.getRowNumber());
    for (var i = 0; i < mergedColumns.length; i++) {
      this.nativeRow.offset(0, this.columns.getColumnOffset(mergedColumns[i]), 2, 1).merge();
    }
    return this.sheet.getRow(this.getRowOffset());
  };

  Spreadsheet.Row.prototype.toObject = function() {
    var ret = {};
    this.columns.columnDefinitions.columnDefinitionsInOrder.forEach(function(columnDefinition) {
      var value = this.getValue(columnDefinition.header);
      ret[columnDefinition.key] = value;
      if (value.getMonth) {
        ret[columnDefinition.key + '_FORMATTED'] = value.getYear() + '/' + String(value.getMonth() + 1).padStart(2, '0') + '/' + String(value.getDate()).padStart(2, '0');
      }
      var formula = this.getFormula(columnDefinition.header);
      if (formula) {
        ret[columnDefinition.key + '_URL'] = Spreadsheet.getUrlFromHyperlinkFormula(formula);
      }
    }.bind(this));
    ret['SHEET'] = this.sheet.getSheetName();
    ret['SHEET_ID'] = this.sheet.getSheetId();
    ret['SHEET_URL'] = Spreadsheet.getSpreadsheetUrl() + '#gid=' + this.sheet.getSheetId();
    return ret;
  };
  
  Spreadsheet.Row.prototype.toString = function() {
    return 'Spreadsheet.Row';
  };

  Spreadsheet.hyperlinkFormula = function(url, text) {
    return '=hyperlink("' + url + '", "' + text + '")'
  };
  
  Spreadsheet.getUrlFromHyperlinkFormula = function(formula) {
    if (!formula) {
      return null;
    }
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
