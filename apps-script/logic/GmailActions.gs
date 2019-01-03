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
      if (threadLabel.getName() === label.getName()) {
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
    Log.info('Changed label to ' + newLabel.getName() + ': ' + subject);
  }
  
  GmailActions.getActions = function(otherLabelNames, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(GmailActions.ACTIONS_IN_INBOX);
    } else {
      actions = actions.concat(GmailActions.ACTIONS_ARCHIVED);
    }
    otherLabelNames.forEach(function(otherLabelName) { actions.push('Move to ' + otherLabelName); });
    return actions;
  }
  
  GmailActions.processActions = function(actionsStr, thread, row, subject, label, noTrackLabel) {
    var actions = actionsStr.split(',');
    var shouldRemove = false;
    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
      var action = actions[actionIndex];
      if (action === '') {
        continue;
      }
      Log.info('Action: ' + action);
      if (action === 'archive') {
        GmailActions.archive(thread, row, subject);
      } else if (action === 'Completed') {
        shouldRemove = true;
        GmailActions.markCompleted(thread, row, subject, noTrackLabel);
      } else if (action === 'Mute') {
        GmailActions.mute(thread, row, subject);
      } else if (action === 'Unlabel') {
        shouldRemove = true;
        GmailActions.removeLabel(thread, row, label, subject);
      } else if (action === 'Inbox') {
        GmailActions.inbox(thread, row, subject);
      } else if (action) {
        if (action.startsWith('Move to ')) {
          var newLabelName = fullCaseAction.substring('Move to '.length);
          var newLabel = Label.getUserDefined(newLabelName);
          if (newLabel) {
            GmailActions.changeLabel(thread, row, subject, label, newLabel);
            shouldRemove = true;
          } else {
            row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Label: ' + newLabelName);
          }
        } else {
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
        }
      }
    }
    return shouldRemove;
  }
}
