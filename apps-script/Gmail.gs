let Gmail = {};
Gmail.initialized = false;

Gmail.NO_TRACK_LABEL = 'No-Track';

Gmail.COLUMN_NAMES = {'THREAD_ID': 'Thread ID',
                      'SUBJECT': 'Subject',
                      'LINK': 'Link',
                      'ITEM': 'Item',
                      'EMAIL': 'Email',
                      'ACTION': 'Action',
                      'INBOX': 'Inbox',
                      'SCRIPT_NOTES': 'Script Notes',
                      'DATE': 'Date',
                      'PRIORITY': 'Priority'};

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
  
  Spreadsheet.init();
  log(Log.Level.INFO, 'Gmail.init()');

  Gmail.initialized = true;
  
  Gmail.sheetIdToSheet = {};
  
  Gmail.Sheet = function(sheet) {
      super(sheet, Gmail.COLUMN_NAMES);
    }
  Gmail.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
    
  Gmail.Sheet.prototype.getRowForId = function(id) {
      log(Log.Level.FINE, 'getRowForId');
      if (!this.rowsById) {
        this.rowsById = {};
        var rows = this.getRows();
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          this.rowsById[row.getValue(Gmail.COLUMN_NAMES.THREAD_ID)] = row;
        }
      }
      if (this.rowsById[id]) {
        return this.rowsById[id];
      }
      var row = this.addRow();
      row.setValue(Gmail.COLUMN_NAMES.THREAD_ID, id);
      this.rowsById[id] = row;
      return row;
    }
    
  Gmail.Sheet.forSheet = function(sheet) {
      if (!Gmail.sheetIdToSheet[sheet.getSheetId()]) {
        Gmail.sheetIdToSheet[sheet.getSheetId()] = new Gmail.Sheet(sheet);
      }
      return Gmail.sheetIdToSheet[sheet.getSheetId()];
    }
    
  Gmail.Sheet.forSheetId = function(sheetId) {
      let sheets = SpreadsheetApp.getActive().getSheets();
      for (let i = 0; i < sheets.length; i++) {
        let sheet = sheets[i];
        if (sheet.getSheetId() == sheetId) {
          return Gmail.Sheet.forSheet(sheet);
        }
      }
      throw new Error('Sheet not found for ' + sheetId);
    }
  }
  
  Gmail.archive = function(thread, row, subject) {
    if (thread.isInInbox()) {
      log(Log.Level.INFO, 'Archiving: ' + subject);
      thread.moveToArchive();
      row.setValue(Gmail.COLUMN_NAMES.ACTION, '');
    } else {
      log(Log.Level.FINE, 'Already archived: ' + subject);
    }
  }
  
  Gmail.inbox = function(thread, row, subject) {
    if (!thread.isInInbox()) {
      log(Log.Level.INFO, 'Moving to inbox: ' + subject);
      thread.moveToInbox();
      row.setValue(Gmail.COLUMN_NAMES.ACTION, '');
      row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Moved to inbox');
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
    let threadLabels = thread.getLabels();
    let labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label) {
        thread.removeLabel(threadLabel);
        row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Removed label');
        labelRemoved = true;
        log(Log.Level.INFO, 'Removed label: ' + subject);
      }
    });
    if (!labelRemoved) {
      row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Label not there');
      log(Log.Level.INFO, 'Label not removed: ' + subject);
    }
  }
  
  Gmail.untrack = function(thread, row, subject, noTrackLabel) {
    thread.addLabel(noTrackLabel);
    row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Stopped Tracking');
    row.setValue(Gmail.COLUMN_NAMES.ACTION, '');
    log(Log.Level.INFO, 'Stopped tracking: ' + subject);
  }
  
  Gmail.labelSearchTerm = function(label) {
    return 'label:' + label.replace(' ', '-');
  }
  
  Gmail.extractBugId = function(subject) {
    let issueIndex = subject.indexOf('Issue ');
    if (issueIndex < 0) {
      return null;
    }
    let nextWordIndex = issueIndex + 'Issue '.length;
    let endOfNextWordIndex = subject.indexOf(':', nextWordIndex);
    if (endOfNextWordIndex < 0) {
      return null;
    }
    return subject.substring(nextWordIndex, endOfNextWordIndex);
  }
  
  Gmail.extractUrls = function(content) {
    let urls = content.match(/https?:\/\/[^ )"><]+/g);
    if (!urls) {
      return [];
    }
    for (let i = 0; i < urls.length; i++) {
      if (urls[i].startsWith('https://www.google.com/url?hl=en&q=')) {
        urls[i] = urls[i].replace('https://www.google.com/url?hl=en&q=');
        let sourceIndex = urls[i].indexOf('&source=');
        if (sourceIndex >= 0) {
          urls[i] = urls[i].substring(0, sourceIndex);
        }
      }
    }
    return urls;
  }
  
  Gmail.extractGoLinks = function(content) {
    let goLinks = content.match(/\Wgo\/[^ )"><]+/g);
    if (!goLinks) {
      return [];
    }
    for (let i = 0; i < goLinks.length; i++) {
      goLinks[i] = goLinks[i].replace(/[ <>"]/g, '');
    }
    return goLinks;
  }
  
  Gmail.extractLinkFormula = function(thread) {
    let bugId = Gmail.extractBugId(thread.getFirstMessageSubject());
    if (bugId) {
      return Spreadsheet.hyperlinkFormula('http://b/' + bugId, 'b/' + bugId);
    }
    let messages = thread.getMessages();
    if (messages.length === 0) {
      return null;
    }
    let urls = Gmail.extractUrls(messages[0].getBody());
    if (!urls || urls.length === 0) {
      return null;
    }
    log(Log.Level.FINE, urls);
    for (let i = 0; i < urls.length; i++) {
      let url = urls[i];
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
    let goLinks = Gmail.extractGoLinks(messages[0].getBody());
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
    let sheet = Gmail.Sheet.forSheetId(sheetId);
    let searchQuery = Gmail.labelSearchTerm(label) + ' -' + Gmail.labelSearchTerm(Gmail.NO_TRACK_LABEL);
    log(Log.Level.INFO, searchQuery);
    var threads = GmailApp.search(searchQuery);
    let noTrackLabel = GmailApp.getUserLabelByName(Gmail.NO_TRACK_LABEL);
    log(Log.Level.INFO, threads.length + ' threads');
    let threadIdsInLabel = [];
    let rowNumbersToRemove = [];
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      let subject = thread.getFirstMessageSubject();
      log(Log.Level.INFO, label + ': ' + (i + 1) + ' / ' + threads.length + ': ' + subject);
      if (subject === 'TTS / STNG') {
        log(Log.Level.INFO, thread.getMessages()[0].getBody());
      }
      var threadId = thread.getId();
      threadIdsInLabel.push(threadId);
      var row = sheet.getRowForId(threadId);
      row.setDataValidation(Gmail.COLUMN_NAMES.ACTION, Gmail.getActions(thread));
      row.setDataValidation(Gmail.COLUMN_NAMES.PRIORITY, Tracking.PRIORITIES);
      row.setValue(Gmail.COLUMN_NAMES.SUBJECT, subject);
      if (!row.getFormula(Gmail.COLUMN_NAMES.LINK)) {
        let linkFormula = Gmail.extractLinkFormula(thread);
        if (linkFormula) {
          row.setValue(Gmail.COLUMN_NAMES.LINK, linkFormula);
        }
      }
      if (row.isNew) {
        log(Log.Level.INFO, 'Added: ' + subject);
        row.setValue(Gmail.COLUMN_NAMES.ITEM, subject);
        row.setFormula(Gmail.COLUMN_NAMES.EMAIL, Spreadsheet.hyperlinkFormula(thread.getPermalink(), 'Email'));
        row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Imported');
      } else {
        log(Log.Level.FINE, 'Already in sheet: ' + subject);
      }
      let action = row.getValue(Gmail.COLUMN_NAMES.ACTION).toLowerCase();
      if (action === 'archive') {
        Gmail.archive(thread, row, subject);
      } else if (action === 'untrack') {
        rowNumbersToRemove.push(row.getRowNumber());
        Gmail.untrack(thread, row, subject, noTrackLabel);
      } else if (action === 'mute') {
        Gmail.mute(thread, row, subject);
      } else if (action === 'unlabel') {
        rowNumbersToRemove.push(row.getRowNumber());
        Gmail.removeLabel(thread, row, label, subject);
      } else if (action === 'archive+unlabel') {
        rowNumbersToRemove.push(row.getRowNumber());
        Gmail.archive(thread, row, subject);
        Gmail.removeLabel(thread, row, label, subject);
      } else if (action === 'archive+untrack') {
        rowNumbersToRemove.push(row.getRowNumber());
        Gmail.archive(thread, row, subject);
        Gmail.untrack(thread, row, subject, noTrackLabel);
      } else if (action === 'inbox') {
        Gmail.inbox(thread, row, subject);
      } else if (action) {
        row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Unknown Action: ' + action);
      }
      row.setValue(Gmail.COLUMN_NAMES.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(Gmail.COLUMN_NAMES.DATE, thread.getLastMessageDate());
    }
    let rows = sheet.getRows();
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let threadId = row.getValue(Gmail.COLUMN_NAMES.THREAD_ID);
      if (threadId && threadIdsInLabel.indexOf(threadId) < 0) {
        row.setValue(Gmail.COLUMN_NAMES.SCRIPT_NOTES, 'Not labeled');
        rowNumbersToRemove.push(row.getRowNumber());
      }
    }
    sheet.removeRows(rowNumbersToRemove);
    // The last sort here will be the primary sort order.
    sheet.sortBy(Gmail.COLUMN_NAMES.DATE).sortBy(Gmail.COLUMN_NAMES.INBOX, false).sortBy(Gmail.COLUMN_NAMES.PRIORITY);
    log(Log.Level.INFO, 'Synced with ' + label);
  }
  
  Gmail.labelProperty = function(sheetId) {
		return 'label:' + sheetId;
	}

	Gmail.setLabelForSheet = function(sheetId, label) {
		PropertiesService.getScriptProperties().setProperty(labelProperty(sheetId), label);
	}

	Gmail.clearLabelForSheet = function(sheetId) {
		PropertiesService.getScriptProperties().deleteProperty(labelProperty(sheetId));
	}

	Gmail.getLabelForSheet = function(sheetId) {
		return PropertiesService.getScriptProperties().getProperty(labelProperty(sheetId));
	}

	Gmail.getAllLabels = function() {
		let ret = [];
		let labels = GmailApp.getUserLabels(); 
		for (let i = 0; i < labels.length; i++) {
			let label = labels[i];
			ret.push(label.getName());
		}
		return JSON.stringify(ret);
	}
  
  Gmail.syncSheet = function(sheetId) {
    let label = getLabelForSheet(sheetId);
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
  let sheets = SpreadsheetApp.getActive().getSheets();
  for (let i = 0; i < sheets.length; i++) {
    let label = getLabelForSheet(sheets[i].getSheetId());
    if (label) {
      Gmail.syncWithGmail(sheets[i].getSheetId(), label);
    }
  }
}