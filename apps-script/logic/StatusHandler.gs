var StatusHandler = {};
StatusHandler.initialized = false;

StatusHandler.init = function() {
  if (StatusHandler.initialized) {
    return;
  }
  
  TrackingSheet.init();
  GmailLabel.init();
  RowUpdate.init();
  Log.info('StatusHandler.init()');
  
  StatusHandler.initialized = true;
  
  StatusHandler.markStatus = function(status, label, rowMutation, thread, removeRow) {
    if (thread) {
      thread.addLabel(label);
    } else {
      rowMutation.addScriptNote('Marked ' + status);
    }
    if (removeRow) {
      rowMutation.removeRow();
    }
  }
  
  StatusHandler.processStatus = function(status, thread) {
    var rowMutation = new RowUpdate.Mutation();
    if (status === '') {
      return rowMutation;
    }
    Log.info('Status: ' + status);
    if (status === 'Completed') {
      StatusHandler.markStatus('Completed', GmailLabel.COMPLETED, rowMutation, thread, true);
    } else if (status === 'Obsolete') {
      StatusHandler.markStatus('Obsolete', GmailLabel.OBSOLETE, rowMutation, thread, true);
    } else if (status === 'In Progress') {
      StatusHandler.markStatus('In Progress', GmailLabel.IN_PROGRESS, rowMutation, thread, false);
    } else if (status === 'On Deck') {
      StatusHandler.markStatus('On Deck', GmailLabel.ON_DECK, rowMutation, thread, false);
    } else if (status === 'Waiting') {
      StatusHandler.markStatus('Waiting', GmailLabel.WAITING, rowMutation, thread, false);
    } else if (status === 'Following') {
      StatusHandler.markStatus('Following', GmailLabel.FOLLOWING, rowMutation, thread, false);
    } else if (status === 'Backburner') {
      StatusHandler.markStatus('Backburner', GmailLabel.BACKBURNER, rowMutation, thread, false);
    }
    return rowMutation;
  }
}
