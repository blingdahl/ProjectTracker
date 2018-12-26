var Gmail = {};
Gmail.initialized = false;

Gmail.NO_TRACK_LABEL = 'No-Track';
Gmail.P0_LABEL = '!Make P0';
Gmail.P1_LABEL = '!Make P1';

Gmail.ACTIONS_IN_INBOX = ['Completed',
                          'Archive',
                          'Unlabel',
                          'Archive,Completed',
                          'Archive,Unlabel',
                          'Mute'];

Gmail.ACTIONS_ARCHIVED = ['Completed',
                          'Unlabel',
                          'Mute',
                          'Inbox'];

Gmail.init = function() {
  if (Gmail.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Organize.init();
  Label.init();
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
  
  Gmail.archive = function(thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving: ' + subject);
      thread.moveToArchive();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    } else {
      Log.fine('Already archived: ' + subject);
    }
  }
  
  Gmail.inbox = function(thread, row, subject) {
    if (!thread.isInInbox()) {
      Log.info('Moving to inbox: ' + subject);
      thread.moveToInbox();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Moved to inbox');
    } else {
      Log.fine('Already in inbox: ' + subject);
    }
  }
  
  Gmail.mute = function(thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving (mute): ' + subject);
      thread.moveToArchive();
    } else {
      Log.fine('Already archived (mute): ' + subject);
    }
  }
  
  Gmail.hasLabel = function(thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var hasLabel = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        hasLabel = true;
      }
    });
    return hasLabel;
  }
  
  Gmail.removeLabel = function(thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label) {
        thread.removeLabel(threadLabel);
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Removed label');
        labelRemoved = true;
        Log.info('Removed label: ' + subject);
      }
    });
    if (!labelRemoved) {
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Label not there');
      Log.info('Label not removed: ' + subject);
    }
  }
  
  Gmail.markCompleted = function(thread, row, subject, noTrackLabel) {
    thread.addLabel(noTrackLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Stopped Tracking');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    Log.info('Stopped tracking: ' + subject);
  }
  
  Gmail.changeLabel = function(thread, row, subject, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Changed label');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    Log.info('Changed label to ' + newLabel + ': ' + subject);
  }
  
  Gmail.getActions = function(otherLabels, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(Gmail.ACTIONS_IN_INBOX);
    } else {
      actions = actions.concat(Gmail.ACTIONS_ARCHIVED);
    }
    otherLabels.forEach(function(otherLabel) { actions.push('Move to ' + otherLabel); });
    return actions;
  }
  
  Gmail.syncWithGmail = function(sheetId, label, maxThreads) {
    Log.info('syncWithGmail');
    var sheet = TrackingSheet.forSheetId(sheetId);
    var searchQuery = Label.searchTerm(label) + ' -' + Label.searchTerm(Gmail.NO_TRACK_LABEL);
    Log.info(searchQuery);
    var gmailLabel = Label.getUserDefined(label);
    var threads = GmailApp.search(searchQuery);
    var totalCount = threads.length;
    threads = threads.slice(0, maxThreads);
    var noTrackLabel = Label.getUserDefined(Gmail.NO_TRACK_LABEL, true);
    var p0Label = Label.getUserDefined(Gmail.P0_LABEL, true);
    var p1Label = Label.getUserDefined(Gmail.P1_LABEL, true);
    Log.info(threads.length + ' threads');
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
      Log.info(label + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
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
        Log.info('Added: ' + subject);
        row.setValue(TrackingSheet.COLUMNS.ITEM, subject);
        row.setFormula(TrackingSheet.COLUMNS.EMAIL, Spreadsheet.hyperlinkFormula(thread.getPermalink(), 'Email'));
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Imported');
        if (Gmail.hasLabel(thread, row, p0Label, subject)) {
          thread.removeLabel(p0Label);
          row.setValue(TrackingSheet.COLUMNS.PRIORITY, 'P0');
        } else if (Gmail.hasLabel(thread, row, p1Label, subject)) {
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
          Gmail.archive(thread, row, subject);
        } else if (action === 'completed') {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
          Gmail.markCompleted(thread, row, subject, noTrackLabel);
        } else if (action === 'mute') {
          Gmail.mute(thread, row, subject);
        } else if (action === 'unlabel') {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
          Gmail.removeLabel(thread, row, label, subject);
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
        if (!row.getValue(TrackingSheet.COLUMNS.PRIORITY)) {
          threadIdsToRemove.push(row.getValue(TrackingSheet.COLUMNS.THREAD_ID));
        }
      }
    }
    for (var i = 0; i < threadIdsToRemove.length; i++) {
      Log.info('Removing thread ' + threadIdsToRemove[i]);
      sheet.removeRow(sheet.getRowForThreadId(threadIdsToRemove[i]));
    }
    Organize.organizeSheet(sheet);
    // The last sort here will be the primary sort order.
    Log.info('Synced with ' + label);
    return totalCount;
  }
  
  Gmail.syncSheet = function(sheetId) {
    var label = Preferences.getLabelNameForSheet(sheetId);
    if (!label) {
      Browser.msgBox('No label for sheet: ' + TrackingSheet.forSheetId(sheetId).getSheetName());
      return;
    }
    var maxThreads = Preferences.getMaxThreadsForSheet(sheetId);
    var totalCount = Gmail.syncWithGmail(sheetId, label, maxThreads);
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