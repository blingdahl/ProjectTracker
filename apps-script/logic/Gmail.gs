var Gmail = {};
Gmail.initialized = false;

Gmail.NO_TRACK_LABEL_NAME = 'No-Track';
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
    var taskSync = TaskSync.forSheet(trackingSheet);
    taskSync.copyCompleted();
    var searchQuery = Label.searchTerm(labelName) + ' -' + Label.searchTerm(Gmail.NO_TRACK_LABEL_NAME);
    Log.info(searchQuery);
    var gmailLabel = Label.getUserDefined(labelName);
    var threads = GmailApp.search(searchQuery);
    var totalCount = threads.length;
    threads = threads.slice(0, maxThreads);
    var noTrackLabel = Label.getUserDefined(Gmail.NO_TRACK_LABEL_NAME, true);
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
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var subject = thread.getFirstMessageSubject() || '(No Subject)';
      Log.info(labelName + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
      var threadId = thread.getId();
      threadIdsInLabel.push(threadId);
      var row = trackingSheet.getRowForThreadId(threadId);
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, GmailActions.getActions(otherLabelNames, thread));
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      row.setValue(TrackingSheet.COLUMNS.SUBJECT, subject);
      row.setValue(TrackingSheet.COLUMNS.FROM, Gmail.getFrom(thread));
      if (!row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        var linkFormula = LinkExtractor.extractLinkFormula(thread);
        if (linkFormula) {
          row.setValue(TrackingSheet.COLUMNS.LINK, linkFormula);
        }
      }
      if (row.isNew) {
        Log.info('Added: ' + subject);
        row.setValue(TrackingSheet.COLUMNS.ITEM, subject);
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
      }
      var fullCaseAction = row.getValue(TrackingSheet.COLUMNS.ACTION);
      var actions = fullCaseAction.toLowerCase().split(',');
      for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        var action = actions[actionIndex];
        if (action === '') {
          continue;
        }
        Log.info('Action: ' + action);
        if (action === 'archive') {
          GmailActions.archive(thread, row, subject);
        } else if (action === 'completed') {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
          GmailActions.markCompleted(thread, row, subject, noTrackLabel);
        } else if (action === 'mute') {
          GmailActions.mute(thread, row, subject);
        } else if (action === 'unlabel') {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
          GmailActions.removeLabel(thread, row, labelName, subject);
        } else if (action === 'inbox') {
          GmailActions.inbox(thread, row, subject);
        } else if (action) {
          if (action.startsWith('move to ')) {
            var newLabelName = fullCaseAction.substring('Move to '.length);
            var newLabel = Label.getUserDefined(newLabelName);
            if (newLabel) {
              GmailActions.changeLabel(thread, row, subject, gmailLabel, newLabel);
              threadIdsToRemove.push(threadId);
            } else {
            row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Label: ' + newLabelName);
            }
          } else {
            row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
          }
        }
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
      trackingSheet.removeRow(sheet.getRowForThreadId(threadIdsToRemove[i]));
    }
    Organize.organizeSheet(trackingSheet);
    // The last sort here will be the primary sort order.
    Log.info('Synced with ' + labelName);
    return totalCount;
  }
  
  Gmail.syncSheet = function(sheetId) {
    var labelName = Preferences.getLabelNameForSheet(sheetId);
    if (!labelName) {
      Browser.msgBox('No label for sheet: ' + TrackingSheet.forSheetId(sheetId).getSheetName());
      return;
    }
    var maxThreads = Preferences.getMaxThreadsForSheet(sheetId);
    var totalCount = Gmail.syncWithGmail(sheetId, labelName, maxThreads);
    return 'Synced ' + Math.min(maxThreads, totalCount) + '/' + totalCount + ' for ' + TrackingSheet.forSheetId(sheetId).getSheetName() + ' sheet';
  }
  
  Gmail.renameLabel = function(sheetId, toLabelName) {
    if (!toLabelName) {
      throw new Error('No toLabelName');
    }
    var currLabel = Label.getUserDefined(Preferences.getLabelNameForSheet(sheetId));
    var threads = currLabel.getThreads();
    var newLabel = GmailApp.createLabel(toLabelName);
    newLabel.addToThreads(threads)
    !currLabel.removeFromThreads(threads);
    Label.setLabelNameForSheet(sheetId, toLabelName);
  }
}

function syncSheetWithGmail(spreadsheetUrl, sheetId) {
  Log.start('syncSheetWithGmail', [sheetId]);
  Gmail.init();
  Log.info('inSyncWithGmail: ' + spreadsheetUrl);
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Gmail.syncSheet(sheetId);
  Log.stop('syncSheetWithGmail', [sheetId]);
  return ret;
}

function renameLabel(spreadsheetUrl, sheetId, toLabelName) {
  Log.start('renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
  Gmail.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Gmail.renameLabel(sheetId, toLabelName);
  Log.stop('renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
}
