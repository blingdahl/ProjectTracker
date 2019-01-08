var Gmail = {};
Gmail.initialized = false;

Gmail.P0_LABEL_NAME = '!Make P0';
Gmail.P1_LABEL_NAME = '!Make P1';

Gmail.init = function() {
  if (Gmail.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Organize.init();
  Label.init();
  GmailActions.init();
  Log.info('Gmail.init()');
  
  Gmail.initialized = true;
  
  Gmail.getFrom = function(thread) {
    var messages = thread.getMessages();
    if (messages.length === 0) {
      return '';
    }
    var from = messages[0].getFrom();
    if (from.indexOf('<') > 5) {
      from = from.substring(0, from.indexOf('<') - 1);
    }
    from = from.replace(/"/g, '');
    return from;
  }
  
  Gmail.syncWithGmail = function(sheetId, labelName, maxThreads) {
    Log.info('syncWithGmail');
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    var taskSync = TaskSync.forTrackingSheet(trackingSheet);
    taskSync.copyCompleted();
    var searchQuery = Label.searchQuery(labelName);
    Log.info(searchQuery);
    var label = Label.getUserDefined(labelName);
    var threads = GmailApp.search(searchQuery);
    var totalCount = threads.length;
    var noTrackLabel = Label.getUserDefined(Label.NO_TRACK_LABEL_NAME, true);
    var p0Label = Label.getUserDefined(Gmail.P0_LABEL_NAME, true);
    var p1Label = Label.getUserDefined(Gmail.P1_LABEL_NAME, true);
    Log.info(threads.length + ' threads');
    var otherLabelNames = Label.getSheetLabelNames();
    for (var i = 0; i < otherLabelNames.length; i++) {
      if (otherLabelNames[i] === labelName) {
        otherLabelNames.splice(i, 1);
        break;
      }
    }
    var threadIdsInLabel = [];
    var threadIdsToRemove = [];
    var numThreads = 0;
    for (var i = 0; i < threads.length && numThreads < maxThreads; i++) {
      var thread = threads[i];
      var subject = thread.getFirstMessageSubject() || '(No Subject)';
      Log.info(labelName + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
      var threadId = thread.getId();
      threadIdsInLabel.push(threadId);
      var row = trackingSheet.getRowForThreadId(threadId);
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, GmailActions.getActions(otherLabelNames, thread));
      row.setValue(TrackingSheet.COLUMNS.SUBJECT, subject);
      row.setValue(TrackingSheet.COLUMNS.FROM, Gmail.getFrom(thread));
      if (!row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        var linkFormula = GmailLinkExtractor.extractLinkFormula(thread);
        if (linkFormula) {
          row.setValue(TrackingSheet.COLUMNS.LINK, linkFormula);
        }
      }
      if (row.isNew) {
        Log.info('Added: ' + subject);
        row.setValue(TrackingSheet.COLUMNS.ITEM, GmailItemNameExtractor.extractItemName(thread));
        row.setFormula(TrackingSheet.COLUMNS.EMAIL, Spreadsheet.hyperlinkFormula(thread.getPermalink(), 'Email'));
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Imported');
        if (Label.hasLabel(thread, row, p0Label, subject)) {
          thread.removeLabel(p0Label);
          row.setValue(TrackingSheet.COLUMNS.PRIORITY, 'P0');
        } else if (Label.hasLabel(thread, row, p1Label, subject)) {
          thread.removeLabel(p1Label);
          row.setValue(TrackingSheet.COLUMNS.PRIORITY, 'P1');
        }
      } else {
        Log.fine('Already in sheet: ' + subject);
        var actionsResult = GmailActions.processActions(
            row.getValue(TrackingSheet.COLUMNS.ACTION), thread, row, subject, label, noTrackLabel);
        if (actionsResult.getShouldRemove()) {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        } else {
          numThreads++;
        }
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, actionsResult.getScriptNotes());
      }
      row.setValue(TrackingSheet.COLUMNS.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(TrackingSheet.COLUMNS.EMAIL_LAST_DATE, thread.getLastMessageDate());
    }
    var rows = trackingSheet.getDataRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var threadId = row.getValue(TrackingSheet.COLUMNS.THREAD_ID);
      if (threadId && threadIdsInLabel.indexOf(threadId) < 0) {
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Not labeled');
        if (!row.getValue(TrackingSheet.COLUMNS.PRIORITY)) {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        }
      }
    }
    for (var i = 0; i < threadIdsToRemove.length; i++) {
      Log.info('Removing thread ' + threadIdsToRemove[i]);
      trackingSheet.removeRow(trackingSheet.getRowForThreadId(threadIdsToRemove[i]));
    }
    Organize.organizeSheet(trackingSheet);
    // The last sort here will be the primary sort order.
    Log.info('Synced with ' + labelName);
    return numThreads + '/' + threads.length;
  }
  
  Gmail.syncSheet = function(sheetId) {
    var labelName = Preferences.Properties.get(Preferences.Names.labelName(sheetId));
    if (!labelName) {
      Browser.msgBox('No label for sheet: ' + TrackingSheet.forSheetId(sheetId).getSheetName());
      return;
    }
    var maxThreads = Preferences.Properties.get(Preferences.Names.maxThreads(sheetId));
    var counts = Gmail.syncWithGmail(sheetId, labelName, maxThreads);
    return 'Synced ' + counts + ' for ' + TrackingSheet.forSheetId(sheetId).getSheetName() + ' sheet';
  }
  
  Gmail.renameLabel = function(sheetId, toLabelName) {
    if (!toLabelName) {
      throw new Error('No toLabelName');
    }
    var currLabel = Label.getUserDefined(Preferences.Properties.get(Preferences.Names.labelNameForSheet(sheetId)));
    var threads = currLabel.getThreads();
    var newLabel = GmailApp.createLabel(toLabelName);
    newLabel.addToThreads(threads)
    !currLabel.removeFromThreads(threads);
    Label.setLabelNameForSheet(sheetId, toLabelName);
  }
}
