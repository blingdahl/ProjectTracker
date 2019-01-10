var GmailSync = {};
GmailSync.initialized = false;

GmailSync.init = function() {
  if (GmailSync.initialized) {
    return;
  }
  
  Log.info('GmailSync.init()');
  
  GmailLabel.init();
  GmailSync.initialized = true
  
  GmailSync.Result = function() {
    this.labelName = null;
    this.totalThreads = null;
    this.synced = false;
    this.threadsById = {};
    this.numThreadsInSheet = 0;
  }
  
  GmailSync.Result.prototype.setLabelName = function(labelName) {
    this.labelName = labelName;
    this.synced = true;
    this.label = GmailLabel.getUserDefined(labelName);
  }
  
  GmailSync.Result.prototype.setTotalThreads = function(totalThreads) {
    this.totalThreads = totalThreads;
  }
  
  GmailSync.Result.prototype.addThread = function(thread) {
    this.threadsById[thread.getId()] = thread;
    this.numThreadsInSheet++;
  }
  
  GmailSync.Result.prototype.getThreadForThreadId = function(threadId) {
    return this.threadsById[threadId];
  }
  
  GmailSync.getOtherLabelNames = function(labelName) {
    var otherLabelNames = GmailLabel.getSheetLabelNames();
    for (var i = 0; i < otherLabelNames.length; i++) {
      if (otherLabelNames[i] === labelName) {
        otherLabelNames.splice(i, 1);
        break;
      }
    }
    return otherLabelNames;
  }
  
  GmailSync.syncFromGmail = function(trackingSheet) {
    var sheetId = trackingSheet.getSheetId();
    var labelName = Preferences.Properties.get(Preferences.Names.labelName(sheetId));
    var syncResult = new GmailSync.Result();
    if (!labelName) {
      return syncResult;
    }
    syncResult.setLabelName(labelName);
    var maxThreads = Preferences.Properties.get(Preferences.Names.maxThreads(sheetId));
    var searchQuery = GmailLabel.searchQuery(labelName);
    var threads = GmailApp.search(searchQuery);
    syncResult.setTotalThreads(threads.length);
    var otherLabelNames = GmailSync.getOtherLabelNames(labelName)
    for (var i = 0; i < threads.length && syncResult.numThreadsInSheet < maxThreads; i++) {
      var thread = threads[i];
      syncResult.addThread(thread);
      var row = trackingSheet.getRowForThreadId(thread.getId());
      if (row.isNew) {
        row.setValue(TrackingSheet.COLUMNS.ITEM, GmailItemNameExtractor.extractItemName(thread));
        row.setFormula(TrackingSheet.COLUMNS.EMAIL, Spreadsheet.hyperlinkFormula(thread.getPermalink(), 'Email'));
        row.setValue(TrackingSheet.COLUMNS.FROM, GmailExtractor.getFrom(thread));
      }
      if (GmailLabel.hasLabel(thread, row, GmailLabel.MAKE_P0)) {
        thread.removeLabel(GmailLabel.MAKE_P0);
        row.setValue(TrackingSheet.COLUMNS.PRIORITY, 'P0');
      } else if (GmailLabel.hasLabel(thread, row, GmailLabel.MAKE_P1)) {
        thread.removeLabel(GmailLabel.MAKE_P1);
        row.setValue(TrackingSheet.COLUMNS.PRIORITY, 'P1');
      }
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, Actions.getGmailActions(otherLabelNames, thread));
      row.setValue(TrackingSheet.COLUMNS.SUBJECT, thread.getFirstMessageSubject() || '(No Subject)');
      if (!row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        var linkFormula = GmailLinkExtractor.extractLinkFormula(thread);
        if (linkFormula) {
          row.setValue(TrackingSheet.COLUMNS.LINK, linkFormula);
        }
      }
      row.setValue(TrackingSheet.COLUMNS.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(TrackingSheet.COLUMNS.EMAIL_LAST_DATE, thread.getLastMessageDate());
    }
    return syncResult;
  };
}