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
  
  GmailSync.copyPriorityFromLabel = function(thread, row, priority) {
    var label = GmailLabel['MAKE_' + priority.toUpperCase()];
    if (GmailLabel.hasLabel(thread, label)) {
      thread.removeLabel(label);
      row.setValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    }
  }
  
  GmailSync.copyPriorityToLabel = function(thread, priority) {
    TrackingSheet.PRIORITIES.forEach(function(currPriority) {
      var currLabel = GmailLabel[currPriority.toUpperCase()];
      Log.info(currPriority + ' vs ' + priority);
      if (currPriority === priority) {
        if (!GmailLabel.hasLabel(thread, currLabel)) {
          thread.addLabel(currLabel);
        }
      } else {
        if (GmailLabel.hasLabel(thread, currLabel)) {
          thread.removeLabel(currLabel);
        }
      }
    });
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
      // End with highest priority because that is the one we want to keep around
      GmailSync.copyPriorityFromLabel(thread, row, 'FOLLOWING');
      GmailSync.copyPriorityFromLabel(thread, row, 'WAITING');
      GmailSync.copyPriorityFromLabel(thread, row, 'P4');
      GmailSync.copyPriorityFromLabel(thread, row, 'P3');
      GmailSync.copyPriorityFromLabel(thread, row, 'P2');
      GmailSync.copyPriorityFromLabel(thread, row, 'P1');
      GmailSync.copyPriorityFromLabel(thread, row, 'P0');
      GmailSync.copyPriorityToLabel(thread, row.getValue(TrackingSheet.COLUMNS.PRIORITY));
      row.setDataValidation(TrackingSheet.COLUMNS.ACTION, ActionHandler.getGmailActions(otherLabelNames, thread));
      row.setValue(TrackingSheet.COLUMNS.SUBJECT, thread.getFirstMessageSubject() || '(No Subject)');
      if (!row.getFormula(TrackingSheet.COLUMNS.LINK)) {
        var linkFormula = GmailLinkExtractor.extractLinkFormula(thread);
        if (linkFormula) {
          row.setValue(TrackingSheet.COLUMNS.LINK, linkFormula);
        }
      }
      if (thread.isInInbox()) {
        var currPriority = row.getValue(TrackingSheet.COLUMNS.PRIORITY);
        if (currPriority != 'P0' && currPriority != 'P1' && currPriority != '') {
          thread.moveToArchive();
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Muted');
        } else {
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Did not archive: ' + (currPriority || 'No priority'));
        }
      }
      row.setValue(TrackingSheet.COLUMNS.INBOX, thread.isInInbox() ? 'Inbox' : 'Archived');
      row.setValue(TrackingSheet.COLUMNS.EMAIL_LAST_DATE, thread.getLastMessageDate());
    }
    return syncResult;
  };
}