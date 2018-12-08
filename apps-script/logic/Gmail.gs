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
  log(Log.Level.INFO, 'Gmail.init()');
  
  Gmail.initialized = true;
  
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
  
  Gmail.labelSearchTerm = function(label) {
    return 'label:' + label.replace(' ', '-');
  }
  
  Gmail.extractBugId = function(subject) {
    var issueIndex = subject.indexOf('Issue ');
    if (issueIndex < 0) {
      return null;
    }
    var nextWordIndex = issueIndex + 'Issue '.length;
    var endOfNextWordIndex = subject.indexOf(':', nextWordIndex);
    if (endOfNextWordIndex < 0) {
      return null;
    }
    return subject.substring(nextWordIndex, endOfNextWordIndex);
  }
  
  Gmail.extractUrls = function(content) {
    var urls = content.match(/https?:\/\/[^ )"><]+/g);
    if (!urls) {
      return [];
    }
    for (var i = 0; i < urls.length; i++) {
      if (urls[i].startsWith('https://www.google.com/url?hl=en&q=')) {
        urls[i] = urls[i].replace('https://www.google.com/url?hl=en&q=');
        var sourceIndex = urls[i].indexOf('&source=');
        if (sourceIndex >= 0) {
          urls[i] = urls[i].substring(0, sourceIndex);
        }
      }
    }
    return urls;
  }
  
  Gmail.extractGoLinks = function(content) {
    var goLinks = content.match(/\Wgo\/[^ )"><]+/g);
    if (!goLinks) {
      return [];
    }
    for (var i = 0; i < goLinks.length; i++) {
      goLinks[i] = goLinks[i].replace(/[ <>"]/g, '');
    }
    return goLinks;
  }
  
  Gmail.extractLinkFormula = function(thread) {
    var bugId = Gmail.extractBugId(thread.getFirstMessageSubject());
    if (bugId) {
      return Spreadsheet.hyperlinkFormula('http://b/' + bugId, 'b/' + bugId);
    }
    var messages = thread.getMessages();
    if (messages.length === 0) {
      return null;
    }
    var urls = Gmail.extractUrls(messages[0].getBody());
    if (!urls || urls.length === 0) {
      return null;
    }
    log(Log.Level.FINE, urls);
    for (var i = 0; i < urls.length; i++) {
      var url = urls[i];
      if (url.startsWith('https://docs.')) {
        if (url.includes('/document')) {
          return Spreadsheet.hyperlinkFormula(url, 'Doc')
        } else if (url.includes('/spreadsheet')) {
          return Spreadsheet.hyperlinkFormula(url, 'Sheet')
        } else {
          return Spreadsheet.hyperlinkFormula(url, 'Link')
        }
      } else if (url.startsWith('https://app.smartsheet.com/b/home')) {
        return Spreadsheet.hyperlinkFormula(url, 'Smartsheet');
      } else if (url.startsWith('http://go/')) {
        return Spreadsheet.hyperlinkFormula(url, url.replace('http://', ''));
      } else if (url.startsWith('https://goto.google.com/')) {
        return Spreadsheet.hyperlinkFormula(url, url.replace('https://goto.google.com/', 'go/'));
      }
    }
    var goLinks = Gmail.extractGoLinks(messages[0].getBody());
    if (goLinks.length > 0) {
      return Spreadsheet.hyperlinkFormula('http://' + goLinks[0], goLinks[0]);
    }
    return null;
  }
  
  Gmail.getActions = function(thread) {
    if (thread.isInInbox()) {
      return Gmail.ACTIONS_IN_INBOX;
    } else {
      return Gmail.ACTIONS_ARCHIVED;
    }
  }
  
  Gmail.syncWithGmail = function(sheetId, label) {
    log(Log.Level.INFO, 'syncWithGmail');
    var sheet = Gmail.Sheet.forSheetId(sheetId);
    var searchQuery = Gmail.labelSearchTerm(label) + ' -' + Gmail.labelSearchTerm(Gmail.NO_TRACK_LABEL);
    log(Log.Level.INFO, searchQuery);
    var threads = GmailApp.search(searchQuery);
    var noTrackLabel = GmailApp.getUserLabelByName(Gmail.NO_TRACK_LABEL);
    if (!noTrackLabel) {
      noTrackLabel = GmailApp.createLabel(Gmail.NO_TRACK_LABEL);
    }
    log(Log.Level.INFO, threads.length + ' threads');
    var threadIdsInLabel = [];
    var threadIdsToRemove = [];
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var subject = thread.getFirstMessageSubject();
      log(Log.Level.INFO, label + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
      var threadId = thread.getId();
      threadIdsInLabel.push(threadId);
      var row = sheet.getRowForId(threadId);
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, Gmail.getActions(thread));
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      row.setValue(TrackingSheet.COLUMNS.SUBJECT, subject);
      if (!row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        var linkFormula = Gmail.extractLinkFormula(thread);
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
      var action = row.getValue(TrackingSheet.COLUMNS.ACTION).toLowerCase();
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
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
      }
      row.setValue(TrackingSheet.COLUMNS.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(TrackingSheet.COLUMNS.DATE, thread.getLastMessageDate());
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
      sheet.removeRow(sheet.getRowForId(threadIdsToRemove[i]));
    }
    // The last sort here will be the primary sort order.
    sheet.sortBy(TrackingSheet.COLUMNS.DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    log(Log.Level.INFO, 'Synced with ' + label);
  }
  
  function labelProperty(sheetId) {
    return 'label:' + sheetId;
  }
  
  function setLabelForSheet(sheetId, label) {
    PropertiesService.getScriptProperties().setProperty(labelProperty(sheetId), label);
  }
  
  function clearLabelForSheet(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(labelProperty(sheetId));
  }
  
  function getLabelForSheet(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(labelProperty(sheetId));
  }
  
  function getAllLabels() {
    var ret = [];
    var labels = GmailApp.getUserLabels(); 
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      ret.push(label.getName());
    }
    return JSON.stringify(ret);
  }
  
  Gmail.syncSheet = function(sheetId) {
    var label = getLabelForSheet(sheetId);
    if (!label) {
      Browser.msgBox('No label for sheet: ' + Gmail.Sheet.forSheetId(sheetId).getSheetName());
      return;
    }
    Gmail.syncWithGmail(sheetId, label);
  }
}

function syncSheetWithGmail(sheetId) {
  Gmail.init();
  Gmail.syncSheet(sheetId);
  return 'Done';
}

function syncCurrentSheetWithGmail() {
  Gmail.init();
  Gmail.syncSheet(Spreadsheet.getActiveSheetId());
}

function syncAllSheetsWithGmail() {
  Gmail.init();
  var sheets = SpreadsheetApp.getActive().getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var label = getLabelForSheet(sheets[i].getSheetId());
    if (label) {
      Gmail.syncWithGmail(sheets[i].getSheetId(), label);
    }
  }
}