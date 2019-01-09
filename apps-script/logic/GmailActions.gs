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

GmailActions.Result = function() {
  this.scriptNotes = [];
  this.shouldRemove = false;
}

GmailActions.Result.prototype.addScriptNote = function(newNote) {
  this.scriptNotes.push(newNote);
}

GmailActions.Result.prototype.getScriptNotes = function() {
  return this.scriptNotes.join('; ');
}

GmailActions.Result.prototype.removeRow = function() {
  this.shouldRemove = true;
}

GmailActions.Result.prototype.getShouldRemove = function() {
  return this.shouldRemove;
}

GmailActions.init = function() {
  if (GmailActions.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Organize.init();
  Label.init();
  Log.info('GmailActions.init()');
  
  GmailActions.initialized = true;
  
  GmailActions.archive = function(result, thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving: ' + subject);
      thread.moveToArchive();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    } else {
      Log.fine('Already archived: ' + subject);
    }
  }
  
  GmailActions.inbox = function(result, thread, row, subject) {
    if (!thread.isInInbox()) {
      Log.info('Moving to inbox: ' + subject);
      thread.moveToInbox();
      row.setValue(TrackingSheet.COLUMNS.ACTION, '');
      result.addScriptNote('Moved to inbox');
    } else {
      Log.fine('Already in inbox: ' + subject);
    }
  }
  
  GmailActions.mute = function(result, thread, row, subject) {
    if (thread.isInInbox()) {
      Log.info('Archiving (mute): ' + subject);
      thread.moveToArchive();
    } else {
      Log.fine('Already archived (mute): ' + subject);
    }
  }
  
  GmailActions.hasLabel = function(result, thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var hasLabel = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        hasLabel = true;
      }
    });
    return hasLabel;
  }
  
  GmailActions.removeLabel = function(result, thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        thread.removeLabel(threadLabel);
        result.addScriptNote('Removed label');
        labelRemoved = true;
        Log.info('Removed label: ' + subject);
      }
    });
    if (!labelRemoved) {
      result.addScriptNote('Label not there');
      row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Label not there');
      Log.info('Label not removed: ' + subject);
    }
  }
  
  GmailActions.markCompleted = function(result, thread, row, subject, noTrackLabel) {
    thread.addLabel(noTrackLabel);
    result.addScriptNote('Stopped tracking');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
    Log.info('Stopped tracking: ' + subject);
  }
  
  GmailActions.changeLabel = function(result, thread, row, subject, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    result.addScriptNote('Changed label');
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
    var result = new GmailActions.Result();
    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
      var action = actions[actionIndex];
      if (action === '') {
        continue;
      }
      Log.info('Action: ' + action);
      if (action === 'archive') {
        GmailActions.archive(result, thread, row, subject);
      } else if (action === 'Completed') {
        result.removeRow();
        GmailActions.markCompleted(result, thread, row, subject, noTrackLabel);
      } else if (action === 'Mute') {
        GmailActions.mute(result, thread, row, subject);
      } else if (action === 'Unlabel') {
        result.removeRow();
        GmailActions.removeLabel(result, thread, row, label, subject);
      } else if (action === 'Inbox') {
        GmailActions.inbox(result, thread, row, subject);
      } else if (action) {
        if (action.startsWith('Move to ')) {
          var newLabelName = action.substring('Move to '.length);
          var newLabel = Label.getUserDefined(newLabelName);
          if (newLabel) {
            GmailActions.changeLabel(result, thread, row, subject, label, newLabel);
            result.removeRow();
          } else {
            result.addScriptNote('Unknown Label: ' + newLabelName);
          }
        } else {
            result.addScriptNote('Unknown Action: ' + action);
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
        }
      }
    }
    return result;
  }
}
