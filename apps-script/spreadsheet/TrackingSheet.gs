var TrackingSheet = {};
TrackingSheet.initialized = false;


TrackingSheet.PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4', 'Following', 'Backburner'];

TrackingSheet.init = function() {
  if (TrackingSheet.initialized) {
    return;
  }
  
  Spreadsheet.init();
  log(Log.Level.INFO, 'TrackingSheet.init()');
  TrackingSheet.initialized = true;

  TrackingSheet.COLUMNS = new Spreadsheet.ColumnDefinitions()
      .addColumn('ITEM', 'Item')
      .addColumn('PRIORITY', 'Priority')
      .addColumn('EMAIL', 'Email')
      .addColumn('LINK', 'Link')
      .addColumn('ACTION', 'Action')
      .addColumn('INBOX', 'Inbox')
      .addColumn('EMAIL_LAST_DATE', 'Email Last Date')
      .addColumn('NOTES', 'Notes')
      .addColumn('THREAD_ID', 'Thread ID')
      .addColumn('SUBJECT', 'Subject')
      .addColumn('SCRIPT_NOTES', 'Script Notes');
  
  TrackingSheet.sheetIdToSheet = {};
  
  TrackingSheet.Sheet = function(sheet) {
    Spreadsheet.Sheet.call(this, sheet, TrackingSheet.COLUMNS);
  }
  TrackingSheet.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
  
  TrackingSheet.Sheet.prototype.getCachedRowOffsetsForColumnValue = function(columnName, value) {
    return this.cache.getRowOffsetsForColumnValue(this.columns.getColumnOffset(columnName), value);
  }
  
  TrackingSheet.Sheet.prototype.getRowsForPriority = function(priority) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    var ret = [];
    rowOffsets.forEach(function(rowOffset) {
      ret.push(this.getRow(rowOffset));
    });
    return ret;
  }
  
  TrackingSheet.Sheet.prototype.getRowForThreadId = function(id) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.THREAD_ID, id);
    if (rowOffsets.length >= 1) {
      return this.getRow(rowOffsets[0]);
    }
    var row = this.addRow();
    row.setValue(TrackingSheet.COLUMNS.THREAD_ID, id);
    return row;
  }
  
  TrackingSheet.Sheet.prototype.toString = function() {
    return 'TrackingSheet.Sheet';
  };
  
  TrackingSheet.forSheet = function(sheet) {
    if (!TrackingSheet.sheetIdToSheet[sheet.getSheetId()]) {
      TrackingSheet.sheetIdToSheet[sheet.getSheetId()] = new TrackingSheet.Sheet(sheet);
    }
    return TrackingSheet.sheetIdToSheet[sheet.getSheetId()];
  }
  
  TrackingSheet.forSheetId = function(sheetId) {
    var sheets = SpreadsheetApp.getActive().getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      if (sheet.getSheetId() == sheetId) {
        return TrackingSheet.forSheet(sheet);
      }
    }
    throw new Error('Sheet not found for ' + sheetId);
  }
  
  TrackingSheet.getAll = function() {
    var sheets = SpreadsheetApp.getActive().getSheets();
    var ret = [];
    sheets.forEach(function(sheet) {
      if (sheet.getSheetName() == 'Overview') {
        log(Log.Level.FINE, 'Not including Overview');
        return;
      }
      var headerRow = sheet.getDataRange().offset(0, 0, 1);
      for (var columnOffset = 0; columnOffset < headerRow.getNumColumns(); columnOffset++) {
        var headerCell = headerRow.offset(0, columnOffset);
        if (headerCell.getValue() === TrackingSheet.COLUMNS.PRIORITY) {
          ret.push(TrackingSheet.forSheet(sheet));
          break;
        }
      }
    });
    return ret;
  }
}