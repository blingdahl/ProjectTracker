var Gmail = {};
Gmail.initialized = false;

Gmail.NO_TRACK_LABEL = 'No-Track';

Gmail.ACTIONS_IN_INBOX = ['Archive',
                          'Untrack',
                          'Unlabel',
                          'Archive+Untrack',
                          'Archive+Unlabel',
                          'Mute'];

Gmail.ACTIONS_ARCHIVED = ['Untrack',
                          'Unlabel',
                          'Mute',
                          'Inbox'];

Gmail.init = function() {
  if (Gmail.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Label.init();
  log(Log.Level.INFO, 'Gmail.init()');
  
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
  
  Gmail.archive = function(thread, row, subject) {
    if (thread.isInInbox()) {
      log(Log.Level.INFO, 'Archiving: ' + subject);
      thread.moveToArchive();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    } else {
      log(Log.Level.FINE, 'Already archived: ' + subject);
    }
  }
  
  Gmail.inbox = function(thread, row, subject) {
    if (!thread.isInInbox()) {
      log(Log.Level.INFO, 'Moving to inbox: ' + subject);
      thread.moveToInbox();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Moved to inbox');
    } else {
      log(Log.Level.FINE, 'Already in inbox: ' + subject);
    }
  }
  
  Gmail.mute = function(thread, row, subject) {
    if (thread.isInInbox()) {
      log(Log.Level.INFO, 'Archiving (mute): ' + subject);
      thread.moveToArchive();
    } else {
      log(Log.Level.FINE, 'Already archived (mute): ' + subject);
    }
  }
  
  Gmail.removeLabel = function(thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label) {
        thread.removeLabel(threadLabel);
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Removed label');
        labelRemoved = true;
        log(Log.Level.INFO, 'Removed label: ' + subject);
      }
    });
    if (!labelRemoved) {
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Label not there');
      log(Log.Level.INFO, 'Label not removed: ' + subject);
    }
  }
  
  Gmail.untrack = function(thread, row, subject, noTrackLabel) {
    thread.addLabel(noTrackLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Stopped Tracking');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    log(Log.Level.INFO, 'Stopped tracking: ' + subject);
  }
  
  Gmail.changeLabel = function(thread, row, subject, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Changed label');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    log(Log.Level.INFO, 'Changed label to ' + newLabel + ': ' + subject);
  }
  
  Gmail.getActions = function(otherLabels, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(Gmail.ACTIONS_IN_INBOX).concat(changeLabelActions);
    } else {
      actions = actions.concat(Gmail.ACTIONS_ARCHIVED);
    }
    otherLabels.forEach(function(otherLabel) { actions.push('Move to ' + otherLabel); });
    return actions;
  }
  
  Gmail.syncWithGmail = function(sheetId, label, maxThreads) {
    log(Log.Level.INFO, 'syncWithGmail');
    var sheet = TrackingSheet.forSheetId(sheetId);
    var searchQuery = Label.searchTerm(label) + ' -' + Label.searchTerm(Gmail.NO_TRACK_LABEL);
    log(Log.Level.INFO, searchQuery);
    var gmailLabel = Label.getUserDefined(label);
    var threads = GmailApp.search(searchQuery);
    var totalCount = threads.length;
    threads = threads.slice(0, maxThreads);
    var noTrackLabel = Label.getUserDefined(Gmail.NO_TRACK_LABEL, true);
    log(Log.Level.INFO, threads.length + ' threads');
    var otherLabels = Label.getSheetLabelNames();
    for (var i = 0; i < otherLabels.length; i++) {
      if (otherLabels[i] === label) {
        otherLabels.splice(i, 1);
        break;
      }
    }
    var threadIdsInLabel = [];
    var threadIdsToRemove = [];
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var subject = thread.getFirstMessageSubject() || '(No Subject)';
      log(Log.Level.INFO, label + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
      var threadId = thread.getId();
      threadIdsInLabel.push(threadId);
      var row = sheet.getRowForThreadId(threadId);
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, Gmail.getActions(otherLabels, thread));
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
        log(Log.Level.INFO, 'Added: ' + subject);
        row.setValue(TrackingSheet.COLUMNS.ITEM, subject);
        row.setFormula(TrackingSheet.COLUMNS.EMAIL, Spreadsheet.hyperlinkFormula(thread.getPermalink(), 'Email'));
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Imported');
      } else {
        log(Log.Level.FINE, 'Already in sheet: ' + subject);
      }
      var fullCaseAction = row.getValue(TrackingSheet.COLUMNS.ACTION);
      var action = fullCaseAction.toLowerCase();
      log(Log.Level.INFO, 'Action: ' + action);
      if (action === 'archive') {
        Gmail.archive(thread, row, subject);
      } else if (action === 'untrack') {
        threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        Gmail.untrack(thread, row, subject, noTrackLabel);
      } else if (action === 'mute') {
        Gmail.mute(thread, row, subject);
      } else if (action === 'unlabel') {
        threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        Gmail.removeLabel(thread, row, label, subject);
      } else if (action === 'archive+unlabel') {
        threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        Gmail.archive(thread, row, subject);
        Gmail.removeLabel(thread, row, label, subject);
      } else if (action === 'archive+untrack') {
        threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        Gmail.archive(thread, row, subject);
        Gmail.untrack(thread, row, subject, noTrackLabel);
      } else if (action === 'inbox') {
        Gmail.inbox(thread, row, subject);
      } else if (action) {
        if (action.startsWith('move to ')) {
          var newLabelName = fullCaseAction.substring('Move to '.length);
          var newLabel = Label.getUserDefined(newLabelName);
          if (newLabel) {
            Gmail.changeLabel(thread, row, subject, gmailLabel, newLabel);
            threadIdsToRemove.push(threadId);
          } else {
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Label: ' + newLabelName);
          }
        } else {
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
        }
      }
      row.setValue(TrackingSheet.COLUMNS.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(TrackingSheet.COLUMNS.EMAIL_LAST_DATE, thread.getLastMessageDate());
    }
    var rows = sheet.getDataRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var threadId = row.getValue(TrackingSheet.COLUMNS.THREAD_ID);
      if (threadId && threadIdsInLabel.indexOf(threadId) < 0) {
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Not labeled');
        threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
      }
    }
    for (var i = 0; i < threadIdsToRemove.length; i++) {
      log(Log.Level.INFO, 'Removing thread ' + threadIdsToRemove[i]);
      sheet.removeRow(sheet.getRowForThreadId(threadIdsToRemove[i]));
    }
    // The last sort here will be the primary sort order.
    sheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    log(Log.Level.INFO, 'Synced with ' + label);
    return totalCount;
  }
  
  Gmail.syncSheet = function(sheetId) {
    var label = Preferences.getLabelNameForSheet(sheetId);
    if (!label) {
      Browser.msgBox('No label for sheet: ' + Gmail.Sheet.forSheetId(sheetId).getSheetName());
      return;
    }
    var maxThreads = Preferences.getMaxThreadsForSheet(sheetId);
    var totalCount = Gmail.syncWithGmail(sheetId, label, maxThreads);
    return 'Synced ' + Math.min(maxThreads, totalCount) + '/' + totalCount;
  }
  
  Gmail.syncAllSheetsWithGmail = function() {
    var sheets = SpreadsheetApp.getActive().getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var label = Preferences.getLabelNameForSheet(sheets[i].getSheetId());
      if (label) {
        Gmail.syncWithGmail(sheets[i].getSheetId(), label);
      }
    }
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
    Label.setLabelForSheet(sheetId, toLabelName);
  }
}

function syncSheetWithGmail(sheetId) {
  logStart('syncSheetWithGmail', [sheetId]);
  Gmail.init();
  var ret = Gmail.syncSheet(sheetId);
  logStop('syncSheetWithGmail', [sheetId]);
  return ret;
}

function syncCurrentSheetWithGmail() {
  logStart('syncCurrentSheetWithGmail', []);
  Gmail.init();
  Gmail.syncSheet(Spreadsheet.getActiveSheetId());
  logStop('syncCurrentSheetWithGmail', []);
}

function syncAllSheetsWithGmail() {
  logStart('syncAllSheetsWithGmail', []);
  Gmail.init();
  Gmail.syncAllSheetsWithGmail();
  logStop('syncAllSheetsWithGmail', []);
}

function renameLabel(sheetId, toLabelName) {
  logStart('renameLabel', [sheetId, toLabelName]);
  log(Log.Level.INFO, 'renameLabel(' + [sheetId, toLabelName].join(',') + ')');
  Gmail.init();
  Gmail.renameLabel(sheetId, toLabelName);
  logStop('renameLabel', [sheetId, toLabelName]);
}