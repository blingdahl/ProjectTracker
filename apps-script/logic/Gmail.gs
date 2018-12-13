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
  
  TrackingSheet.init();
  Label.init();
  log(Log.Level.INFO, 'Gmail.init()');
  
  Gmail.initialized = true;
  
  Gmail.getFrom = function(thread) {
    var messages = thread.getMessages();
    if (messages.length === 0) {
      return '';
    }
    return messages[0].getFrom();
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
    var threads = GmailApp.search(searchQuery).slice(0, maxThreads);
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
    var rows = sheet.getRows();
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
  }
  
  Gmail.syncSheet = function(sheetId) {
    var label = Label.getLabelForSheet(sheetId);
    if (!label) {
      Browser.msgBox('No label for sheet: ' + Gmail.Sheet.forSheetId(sheetId).getSheetName());
      return;
    }
    var maxThreads = Gmail.getMaxThreadsForSheet(sheetId);
    Gmail.syncWithGmail(sheetId, label, maxThreads);
  }
  
  Gmail.maxThreadsProperty = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }
  
  Gmail.setMaxThreadsForSheet = function(sheetId, maxThreads) {
    PropertiesService.getScriptProperties().setProperty(Gmail.maxThreadsProperty(sheetId), maxThreads);
  }
  
  Gmail.clearMaxThreadsForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Gmail.maxThreadsProperty(sheetId));
  }
  
  Gmail.getMaxThreadsForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(parseInt(Gmail.maxThreadsProperty(sheetId))) || Gmail.DEFAULT_MAX_THREADS;
  }
  
  Gmail.syncAllSheetsWithGmail = function() {
    var sheets = SpreadsheetApp.getActive().getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var label = Label.getLabelForSheet(sheets[i].getSheetId());
      if (label) {
        Gmail.syncWithGmail(sheets[i].getSheetId(), label);
      }
    }
  }
  
  Gmail.renameLabel = function(sheetId, toLabelName) {
    if (!toLabelName) {
      throw new Error('No toLabelName');
    }
    var currLabel = Label.getUserDefined(Label.getLabelForSheet(sheetId));
    var threads = currLabel.getThreads();
    var newLabel = GmailApp.createLabel(toLabelName);
    newLabel.addToThreads(threads)
    !currLabel.removeFromThreads(threads);
    Gmail.setLabelForSheet(sheetId, toLabelName);
  }
  
  Gmail.DEFAULT_MAX_THREADS = 50;
}

function setMaxThreadsForSheet(sheetId, maxThreads) {
  logStart('setMaxThreadsForSheet', [sheetId, maxThreads]);
  Gmail.init();
  Gmail.setMaxThreadsForSheet(sheetId, maxThreads);
  logStop('setMaxThreadsForSheet', [sheetId, maxThreads]);
}

function clearMaxThreadsForSheet(sheetId) {
  logStart('clearMaxThreadsForSheet', [sheetId]);
  Gmail.init();
  Gmail.clearMaxThreadsForSheet(sheetId);
  logStop('clearMaxThreadsForSheet', [sheetId]);
}

function getMaxThreadsForSheet(sheetId) {
  logStart('getMaxThreadsForSheet', [sheetId]);
  Gmail.init();
  var ret = Gmail.getMaxThreadsForSheet(sheetId);
  logStop('getMaxThreadsForSheet', [sheetId]);
  return ret;
}

function syncSheetWithGmail(sheetId) {
  logStart('syncSheetWithGmail', [sheetId]);
  Gmail.init();
  Gmail.syncSheet(sheetId);
  logStop('syncSheetWithGmail', [sheetId]);
  return 'Done';
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