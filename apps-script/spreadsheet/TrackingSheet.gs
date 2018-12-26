var TrackingSheet = {};
TrackingSheet.initialized = false;


TrackingSheet.PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4', 'Following', 'Backburner', 'Waiting'];
TrackingSheet.NON_GMAIL_ACTIONS = ['Completed'];

TrackingSheet.init = function() {
  if (TrackingSheet.initialized) {
    return;
  }
  
  Spreadsheet.init();
  Preferences.init();
  Log.info('TrackingSheet.init()');
  TrackingSheet.initialized = true;

  TrackingSheet.COLUMNS = new Spreadsheet.ColumnDefinitions()
      .addColumn('ITEM', 'Item')
      .addColumn('PRIORITY', 'Priority')
      .addColumn('ACTION', 'Action')
      .addColumn('EMAIL', 'Email')
      .addColumn('LINK', 'Link')
      .addColumn('STATUS', 'Status')
      .addColumn('TO_DO', 'To Do')
      .addColumn('INBOX', 'Inbox')
      .addColumn('EMAIL_LAST_DATE', 'Email Last Date')
      .addColumn('NOTES', 'Notes')
      .addColumn('FROM', 'From')
      .addColumn('SCRIPT_NOTES', 'Script Notes')
      .addColumn('THREAD_ID', 'Thread ID')
      .addColumn('SUBJECT', 'Subject')
      .addColumn('UUID', 'UUID');
  
  TrackingSheet.sheetIdToSheet = {};
  
  TrackingSheet.Sheet = function(sheet) {
    Spreadsheet.Sheet.call(this, sheet, TrackingSheet.COLUMNS);
  }
  TrackingSheet.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
  
  TrackingSheet.Sheet.prototype.getCachedRowOffsetsForColumnValue = function(columnHeader, value) {
    return this.cache.getRowOffsetsForColumnValue(this.columns.getColumnOffset(columnHeader), value);
  }
  
  TrackingSheet.Sheet.prototype.getRowsForPriority = function(priority) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    var ret = [];
    rowOffsets.forEach(function(rowOffset) {
      ret.push(this.getRow(rowOffset));
    }.bind(this));
    return ret;
  }
  
  // TODO(lindahl) Rename threadId
  TrackingSheet.Sheet.prototype.getRowForThreadId = function(id) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.THREAD_ID, id);
    if (rowOffsets.length >= 1) {
      return this.getRow(rowOffsets[0]);
    }
    var row = this.addRow();
    row.setValue(TrackingSheet.COLUMNS.THREAD_ID, id);
    return row;
  }
  
  TrackingSheet.Sheet.prototype.getRowForUuid = function(uuid) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.UUID, uuid);
    if (rowOffsets.length >= 1) {
      return this.getRow(rowOffsets[0]);
    }
    throw new Error('No row for uuid ' + uuid);
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
    return TrackingSheet.forSheet(Spreadsheet.getSpreadsheet().getNativeSheet(sheetId));
  }
  
  TrackingSheet.getAll = function() {
    var sheets = Spreadsheet.getSpreadsheet().getNativeSheets();
    var ret = [];
    sheets.forEach(function(sheet) {
      if (sheet.getSheetName() == 'Overview') {
        Log.fine('Not including Overview');
        return;
      }
      if (Preferences.getTrackedForSheet(sheet.getSheetId())) {
        ret.push(TrackingSheet.forSheet(sheet));
      }
    });
    return ret;
  }
}
