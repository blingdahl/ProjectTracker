var Update = {};
Update.initialized = false;

Update.init = function() {
  if (Update.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
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
    trackingSheet.setNumBlankRows(Update.EXTRA_ROWS);
    var syncResult = GmailSync.syncFromGmail(trackingSheet);
    var threadsById = {};
    var uuidsToRemove = [];
    var countPerPriority = {};
    for (var i = 0; i < TrackingSheet.PRIORITIES.length; i++) {
      countPerPriority[TrackingSheet.PRIORITIES[i]] = 0;
    }
    countPerPriority[''] = 0;
    var rows = trackingSheet.getDataRows(true);
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      row.setDataValidation(TrackingSheet.COLUMNS.STATUS, TrackingSheet.STATUSES);
      if (!row.getValue(TrackingSheet.COLUMNS.ITEM) && !row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        row.removeDataValidation(TrackingSheet.COLUMNS.ACTION);
        continue;
      }
      var thread = null;
      var threadId = row.getValue(TrackingSheet.COLUMNS.THREAD_ID);
      if (threadId) {
        thread = syncResult.getThreadForThreadId(threadId);
      } else {
        row.removeDataValidation(TrackingSheet.COLUMNS.ACTION);
      }
      if (!row.getValue(TrackingSheet.COLUMNS.UUID)) {
        row.setValue(TrackingSheet.COLUMNS.UUID, Utilities.getUuid());
      }
      var actionsResult = ActionHandler.processActions(row.getValue(TrackingSheet.COLUMNS.ACTION), thread, syncResult.label);
      var statusResult = StatusHandler.processStatus(row.getValue(TrackingSheet.COLUMNS.STATUS), thread, syncResult.label);
      if (!actionsResult.getShouldRemove() && !statusResult.getShouldRemove() && threadId && !thread) {
        if (row.getValue(TrackingSheet.COLUMNS.PRIORITY)) {
          actionsResult.addScriptNote('Not labeled');
        } else {
          actionsResult.addScriptNote('Not labeled; removing');
          actionsResult.removeRow();
        }
      }
      if (actionsResult.getShouldRemove() || statusResult.getShouldRemove()) {
        uuidsToRemove.push(row.getValue(TrackingSheet.COLUMNS.UUID));
      } else {
        countPerPriority[row.getValue(TrackingSheet.COLUMNS.PRIORITY)]++;
      }
      if (actionsResult.hasScriptNotes() || statusResult.hasScriptNotes()) {
        var scriptNotes = [];
        if (actionsResult.hasScriptNotes()) {
          actionsResult.getScriptNotes();
        }
        if (statusResult.hasScriptNotes()) {
          statusResult.getScriptNotes();
        }
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, scriptNotes.join('\n'));
      }
    }
    for (var i = 0; i < uuidsToRemove.length; i++) {
      Log.info('Removing thread ' + uuidsToRemove[i]);
      trackingSheet.removeRow(trackingSheet.getRowForUuid(uuidsToRemove[i]));
    }
    trackingSheet.
        sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE, false).
        sortBy(TrackingSheet.COLUMNS.INBOX, false).
        sortBy(TrackingSheet.COLUMNS.STATUS, true).
        sortBy(TrackingSheet.COLUMNS.PRIORITY);
    var response = '';
    var parentheticalMessages = [];
    for (var i = 0; i < TrackingSheet.PRIORITIES.length; i++) {
      var priority = TrackingSheet.PRIORITIES[i];
      if (countPerPriority[priority] !== 0) {
        parentheticalMessages.push(countPerPriority[priority] + ' ' + (priority || 'unprioritized'));
      }
    }
    if (countPerPriority[''] !== 0) {
      parentheticalMessages.push(countPerPriority[''] + ' unprioritized');
    }
    parentheticalMessages.push(uuidsToRemove.length + ' removed');
    response += 'Updated ' + TrackingSheet.forSheetId(sheetId).getSheetName() + ' (' + parentheticalMessages.join(', ') + ')';
    if (syncResult.synced) {
      response += ': Synced ' + syncResult.numThreadsInSheet + '/' + syncResult.totalThreads;
    }
    return response;
  }
  
  Update.changeSheet = function(fromSheetId, toSheetId, uuid) {
    var fromSheet = TrackingSheet.forSheetId(fromSheetId);
    var fromRow = fromSheet.getRowForUuid(uuid);
    var threadId = fromRow.getValue(TrackingSheet.COLUMNS.THREAD_ID);
    if (threadId) {
      var thread = GmailApp.getThreadById(threadId);
      var fromLabelName = Preferences.Properties.get(Preferences.Names.labelName(fromSheetId));
      var toLabelName = Preferences.Properties.get(Preferences.Names.labelName(toSheetId));
      if (!fromLabelName) {
        throw new Error('From sheet does not have a label');
      }
      if (!toLabelName) {
        throw new Error('To sheet does not have a label');
      }
      var fromLabel = GmailLabel.getUserDefined(fromLabelName);
      var toLabel = GmailLabel.getUserDefined(toLabelName);
      GmailLabel.removeLabel(thread, fromLabel);
      GmailLabel.addLabel(thread, toLabel);
    }
    var toSheet = TrackingSheet.forSheetId(toSheetId);
    toSheet.addCopyOfRow(fromRow);
    fromSheet.removeRow(fromRow);
    return 'Moved to ' + toSheet.getSheetName();
  }
}
