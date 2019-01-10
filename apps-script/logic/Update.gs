var Update = {};
Update.initialized = false;

Update.init = function() {
  if (Update.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Actions.init();
  TaskSync.init();
  GmailSync.init();
  Log.info('Update.init()');
  
  Update.initialized = true;
  
  Update.EXTRA_ROWS = 10;
  
  Update.update = function(sheetId) {
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    var taskSync = TaskSync.forTrackingSheet(trackingSheet);
    taskSync.copyCompleted();
    trackingSheet.setNumBlankRows(Update.EXTRA_ROWS);
    var syncResult = GmailSync.syncFromGmail(trackingSheet);
    var threadsById = {};
    var uuidsToRemove = [];
    var dataRows = trackingSheet.getDataRows();
    for (var i = 0; i < dataRows.length; i++) {
      var dataRow = dataRows[i];
      dataRow.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      if (!dataRow.getValue(TrackingSheet.COLUMNS.ITEM)) {
        continue;
      }
      var thread = null;
      var threadId = dataRow.getValue(TrackingSheet.COLUMNS.THREAD_ID);
      if (threadId) {
        thread = syncResult.getThreadForThreadId(threadId);
      } else {
        
      }
      if (!dataRow.getValue(TrackingSheet.COLUMNS.UUID)) {
        dataRow.setValue(TrackingSheet.COLUMNS.UUID, Utilities.getUuid());
      }
      var actionsResult = Actions.processActions(dataRow.getValue(TrackingSheet.COLUMNS.ACTION), thread, dataRow, syncResult.label);
      if (!actionsResult.getShouldRemove() && threadId && !thread) {
        if (dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY)) {
          actionsResult.addScriptNote('Not labeled');
        } else {
          actionsResult.addScriptNote('Not labeled; removing');
          actionsResult.removeRow();
        }
      }
      if (actionsResult.getShouldRemove()) {
        uuidsToRemove.push(dataRow.getValue(TrackingSheet.COLUMNS.UUID));
      }
      dataRow.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, actionsResult.getScriptNotes());
    }
    for (var i = 0; i < uuidsToRemove.length; i++) {
      Log.info('Removing thread ' + uuidsToRemove[i]);
      trackingSheet.removeRow(trackingSheet.getRowForUuid(uuidsToRemove[i]));
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    taskSync.syncToTasks(trackingSheet);
    if (syncResult.synced) {
      return 'Synced ' + syncResult.numThreadsInSheet + '/' + syncResult.totalThreads + ' for ' + TrackingSheet.forSheetId(sheetId).getSheetName() + ' sheet';
    } else {
      return 'Updated';
    }
  }
}
