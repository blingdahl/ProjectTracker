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
      .addColumn('TO_DO', 'To Do')
      .addColumn('INBOX', 'Inbox')
      .addColumn('EMAIL_LAST_DATE', 'Email Last Date')
      .addColumn('NOTES', 'Notes')
      .addColumn('FROM', 'From')
      .addColumn('SCRIPT_NOTES', 'Script Notes')
      .addColumn('THREAD_ID', 'Thread ID')
      .addColumn('SUBJECT', 'Subject')
      .addColumn('UUID', 'UUID')
      .addColumn('TASK_ID', 'Task ID');
  
  TrackingSheet.sheetIdToSheet = {};
  
  TrackingSheet.Sheet = function(sheet) {
    Spreadsheet.Sheet.call(this, sheet, TrackingSheet.COLUMNS);
  }
  TrackingSheet.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
  
  TrackingSheet.Sheet.prototype.getCachedRowOffsetsForColumnValue = function(columnHeader, value) {
    return this.cache.getRowOffsetsForColumnValue(this.columns.getColumnOffset(columnHeader), value);
  }
  
  TrackingSheet.Sheet.prototype.getRowsForPriority = function(priority) {
    return this.getRowsByPriority()[priority] || [];
  }
  
  TrackingSheet.Sheet.prototype.getRowsByPriority = function() {
    return indexMultimap(this.getDataRows(), function(dataRow) { return dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY); });
  }
  
  TrackingSheet.Sheet.prototype.getRowForThreadId = function(threadId) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.THREAD_ID, threadId);
    if (rowOffsets.length >= 1) {
      return this.getRow(rowOffsets[0]);
    }
    var row = this.addRow();
    row.setValue(TrackingSheet.COLUMNS.THREAD_ID, threadId);
    return row;
  }
  
  TrackingSheet.Sheet.prototype.getRowForTaskId = function(taskId) {
    var rowOffsets = this.getCachedRowOffsetsForColumnValue(TrackingSheet.COLUMNS.TASK_ID, taskId);
    if (rowOffsets.length >= 1) {
      return this.getRow(rowOffsets[0]);
    }
    throw new Error('No row for task id ' + taskId);
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
