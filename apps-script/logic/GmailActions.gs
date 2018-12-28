var GmailActions = {};
GmailActions.initialized = false;

GmailActions.ACTIONS_IN_INBOX = ['Completed',
                                 'Archive',
                                 'Unlabel',
                                 'Archive,Completed',
                                 'Archive,Unlabel',
                                 'Mute'];

GmailActions.ACTIONS_ARCHIVED = ['Completed',
                                 'Unlabel',
                                 'Mute',
                                 'Inbox'];

GmailActions.init = function() {
  if (GmailActions.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Organize.init();
  Label.init();
  Log.info('GmailActions.init()');
  
  GmailActions.initialized = true;
  
  GmailActions.archive = function(thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving: ' + subject);
      thread.moveToArchive();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    } else {
      Log.fine('Already archived: ' + subject);
    }
  }
  
  GmailActions.inbox = function(thread, row, subject) {
    if (!thread.isInInbox()) {
      Log.info('Moving to inbox: ' + subject);
      thread.moveToInbox();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Moved to inbox');
    } else {
      Log.fine('Already in inbox: ' + subject);
    }
  }
  
  GmailActions.mute = function(thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving (mute): ' + subject);
      thread.moveToArchive();
    } else {
      Log.fine('Already archived (mute): ' + subject);
    }
  }
  
  GmailActions.hasLabel = function(thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var hasLabel = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        hasLabel = true;
      }
    });
    return hasLabel;
  }
  
  GmailActions.removeLabel = function(thread, row, label, subject) {
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
  
  GmailActions.markCompleted = function(thread, row, subject, noTrackLabel) {
    thread.addLabel(noTrackLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Stopped Tracking');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    Log.info('Stopped tracking: ' + subject);
  }
  
  GmailActions.changeLabel = function(thread, row, subject, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Changed label');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    Log.info('Changed label to ' + newLabel + ': ' + subject);
  }
  
  GmailActions.getActions = function(otherLabels, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(GmailActions.ACTIONS_IN_INBOX);
    } else {
      actions = actions.concat(GmailActions.ACTIONS_ARCHIVED);
    }
    otherLabels.forEach(function(otherLabel) { actions.push('Move to ' + otherLabel); });
    return actions;
  }
}