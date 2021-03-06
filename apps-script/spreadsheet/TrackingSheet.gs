var TrackingSheet = {};
TrackingSheet.initialized = false;


TrackingSheet.PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4'];

TrackingSheet.STATUSES = ['Completed',
                          'Obsolete',
                          'In Progress',
                          'On Deck',
                          'Waiting',
                          'Following',
                          'Backburner'];

TrackingSheet.init = function() {
  if (TrackingSheet.initialized) {
    return;
  }
  
  Spreadsheet.init();
  Preferences.init();
  Log.info('TrackingSheet.init()');
  TrackingSheet.initialized = true;
  
  Spreadsheet.setSpreadsheetUrl(Preferences.Properties.get(Preferences.Names.spreadsheetUrl()));

  TrackingSheet.COLUMNS = new Spreadsheet.ColumnDefinitions()
      .addColumn('ITEM', 'Item')
      .addColumn('PRIORITY', 'Priority')
      .addColumn('ACTION', 'Action')
      .addColumn('STATUS', 'Status')
      .addColumn('EMAIL', 'Email')
      .addColumn('LINK', 'Link')
      .addColumn('TO_DO', 'To Do')
      .addColumn('INBOX', 'Inbox')
      .addColumn('EMAIL_LAST_DATE', 'Email Last Date')
      .addColumn('NEXT_ACTION_DATE', 'Next Action Date')
      .addColumn('NEXT_ACTION_DATE_UPDATED', 'Next Action Date Updated')
      .addColumn('DUE_DATE', 'Due Date')
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
    this.cache.precache();
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
  
  TrackingSheet.forNativeSheet = function(nativeSheet) {
    var sheetId = nativeSheet.getSheetId();
    if (!TrackingSheet.sheetIdToSheet[sheetId]) {
      TrackingSheet.sheetIdToSheet[sheetId] = new TrackingSheet.Sheet(nativeSheet);
    }
    return TrackingSheet.sheetIdToSheet[sheetId];
  }
  
  TrackingSheet.forSheetId = function(sheetId) {
    return TrackingSheet.forNativeSheet(Spreadsheet.getSpreadsheet().getNativeSheet(sheetId));
  }
  
  TrackingSheet.getAll = function() {
    var nativeSheets = Spreadsheet.getSpreadsheet().getNativeSheets();
    var ret = [];
    nativeSheets.forEach(function(nativeSheet) {
      if (Preferences.Properties.get(Preferences.Names.tracked(nativeSheet.getSheetId()))) {
        ret.push(TrackingSheet.forNativeSheet(nativeSheet));
      }
    });
    return ret;
  }
}
