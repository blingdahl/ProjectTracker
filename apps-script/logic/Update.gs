var Update = {};
Update.initialized = false;

Update.init = function() {
  if (Update.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  TaskSync.init();
  GmailSync.init();
  ActionHandler.init();
  StatusHandler.init();
  Log.info('Update.init()');
  
  Update.initialized = true;
  
  Update.EXTRA_ROWS = 10;
  
  Update.clearScriptNotes = function(trackingSheet) {
    var dataRows = trackingSheet.getDataRows();
    for (var i = 0; i < dataRows.length; i++) {
      dataRows[i].setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, '');
    }
  }
  
  Update.update = function(sheetId) {
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    Update.clearScriptNotes(trackingSheet);
    var taskSync = TaskSync.forTrackingSheet(trackingSheet);
    taskSync.copyCompleted();
    trackingSheet.setNumBlankRows(Update.EXTRA_ROWS);
    var syncResult = GmailSync.syncFromGmail(trackingSheet);
    var threadsById = {};
    var uuidsToRemove = [];
    var countPerPriority = {};
    for (var i = 0; i < TrackingSheet.PRIORITIES.length; i++) {
      countPerPriority[TrackingSheet.PRIORITIES[i]] = 0;
    }
    countPerPriority[''] = 0;
    var dataRows = trackingSheet.getDataRows();
    for (var i = 0; i < dataRows.length; i++) {
      var dataRow = dataRows[i];
      dataRow.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      dataRow.setDataValidation(TrackingSheet.COLUMNS.STATUS, StatusHandler.STATUSES);
      if (!dataRow.getValue(TrackingSheet.COLUMNS.ITEM)) {
        continue;
      }
      var thread = null;
      var threadId = dataRow.getValue(TrackingSheet.COLUMNS.THREAD_ID);
      if (threadId) {
        thread = syncResult.getThreadForThreadId(threadId);
      } else {
        dataRow.removeDataValidation(TrackingSheet.COLUMNS.ACTION);
      }
      if (!dataRow.getValue(TrackingSheet.COLUMNS.UUID)) {
        dataRow.setValue(TrackingSheet.COLUMNS.UUID, Utilities.getUuid());
      }
      var actionsResult = ActionHandler.processActions(dataRow.getValue(TrackingSheet.COLUMNS.ACTION), thread, syncResult.label);
      var statusResult = StatusHandler.processStatus(dataRow.getValue(TrackingSheet.COLUMNS.STATUS), thread, syncResult.label);
      if (!actionsResult.getShouldRemove() && !statusResult.getShouldRemove() && threadId && !thread) {
        if (dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY)) {
          actionsResult.addScriptNote('Not labeled');
        } else {
          actionsResult.addScriptNote('Not labeled; removing');
          actionsResult.removeRow();
        }
      }
      if (actionsResult.getShouldRemove() || statusResult.getShouldRemove()) {
        uuidsToRemove.push(dataRow.getValue(TrackingSheet.COLUMNS.UUID));
      } else {
        countPerPriority[dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY)]++;
      }
      if (actionsResult.hasScriptNotes() || statusResult.hasScriptNotes()) {
        dataRow.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, [actionsResult.getScriptNotes(), statusResult.getScriptNotes()].join('\n'));
      }
    }
    for (var i = 0; i < uuidsToRemove.length; i++) {
      Log.info('Removing thread ' + uuidsToRemove[i]);
      trackingSheet.removeRow(trackingSheet.getRowForUuid(uuidsToRemove[i]));
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    taskSync.syncToTasks(trackingSheet);
    var response = '';
    var priorityStrings = [];
    for (var priority in countPerPriority) {
      if (countPerPriority[priority] !== 0) {
        priorityStrings.push(countPerPriority[priority] + ' ' + (priority || 'unprioritized'));
      }
    }
    response += 'Updated ' + TrackingSheet.forSheetId(sheetId).getSheetName() + ' (' + priorityStrings.join(', ') + ', ' + uuidsToRemove.length + ' removed)';
    if (syncResult.synced) {
      response += ': Synced ' + syncResult.numThreadsInSheet + '/' + syncResult.totalThreads;
    }
    return response;
  }
}
