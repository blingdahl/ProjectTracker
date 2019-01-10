var Actions = {};
Actions.initialized = false;

Actions.init = function() {
  if (Actions.initialized) {
    return;
  }
  
  TrackingSheet.init();
  GmailLabel.init();
  Log.info('Actions.init()');
  
  Actions.initialized = true;

  Actions.GMAIL_ACTIONS_IN_INBOX = ['Completed',
                                    'Archive',
                                    'Unlabel',
                                    'Archive,Completed',
                                     'Archive,Unlabel',
                                    'Mute'];
  
  Actions.GMAIL_ACTIONS_ARCHIVED = ['Completed',
                                    'Unlabel',
                                    'Mute',
                                    'Inbox'];
  
  Actions.NON_GMAIL_ACTIONS = ['Completed'];
  
  Actions.Result = function() {
    this.scriptNotes = [];
    this.shouldRemove = false;
    this.shouldClearAction = false;
  }
  
  Actions.Result.prototype.addScriptNote = function(newNote) {
    this.scriptNotes.push(newNote);
  }
  
  Actions.Result.prototype.getScriptNotes = function() {
    return this.scriptNotes.join('; ');
  }
  
  Actions.Result.prototype.removeRow = function() {
    this.shouldRemove = true;
  }
  
  Actions.Result.prototype.getShouldRemove = function() {
    return this.shouldRemove;
  }
  
  Actions.Result.prototype.clearAction = function() {
    this.shouldClearAction = true;
  }
  
  Actions.Result.prototype.getShouldClearAction = function() {
    return this.shouldClearAction;
  }
  
  Actions.archive = function(result, thread, row) {
    if (thread.isInInbox()) {
      thread.moveToArchive();
      result.addScriptNote('Archived');
      result.clearAction();
    }
  }
  
  Actions.inbox = function(result, thread, row) {
    if (!thread.isInInbox()) {
      thread.moveToInbox();
      result.addScriptNote('Moved to inbox');
      result.clearAction();
    }
  }
  
  Actions.mute = function(result, thread, row) {
    if (thread.isInInbox()) {
      thread.moveToArchive();
    }
  }
  
  Actions.removeLabel = function(result, thread, row, label) {
    var threadLabels = thread.getLabels();
    var labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        thread.removeLabel(threadLabel);
        result.addScriptNote('Removed label');
        labelRemoved = true;
      }
    });
    if (!labelRemoved) {
      result.addScriptNote('Label not there');
    }
  }
  
  Actions.markCompleted = function(result, thread, row) {
    if (thread) {
      thread.addLabel(GmailLabel.NO_TRACK);
      result.addScriptNote('Stopped tracking');
    } else {
      result.addScriptNote('Marked completed');
    }
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
  }
  
  Actions.changeLabel = function(result, thread, row, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    result.addScriptNote('Changed label');
    row.setValue(TrackingSheet.COLUMNS.ACTION, '');
  }
  
  Actions.getGmailActions = function(otherLabelNames, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(Actions.ACTIONS_IN_INBOX);
    } else {
      actions = actions.concat(Actions.ACTIONS_ARCHIVED);
    }
    otherLabelNames.forEach(function(otherLabelName) { actions.push('Move to ' + otherLabelName); });
    return actions;
  }
  
  Actions.processActions = function(actionsStr, thread, row, label) {
    var actions = actionsStr.split(',');
    var result = new Actions.Result();
    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
      var action = actions[actionIndex];
      if (action === '') {
        continue;
      }
      Log.info('Action: ' + action);
      if (action === 'Archive') {
        Actions.archive(result, thread, row);
      } else if (action === 'Completed') {
        result.removeRow();
        Actions.markCompleted(result, thread, row);
      } else if (action === 'Mute') {
        Actions.mute(result, thread, row);
      } else if (action === 'Unlabel') {
        result.removeRow();
        Actions.removeLabel(result, thread, row, label);
      } else if (action === 'Inbox') {
        Actions.inbox(result, thread, row);
      } else if (action) {
        if (action.startsWith('Move to ')) {
          var newLabelName = action.substring('Move to '.length);
          var newLabel = GmailLabel.getUserDefined(newLabelName);
          if (newLabel) {
            Actions.changeLabel(result, thread, row, label, newLabel);
            result.removeRow();
          } else {
            result.addScriptNote('Unknown Label: ' + newLabelName);
          }
        } else {
          result.addScriptNote('Unknown Action: ' + action);
        }
      }
    }
    return result;
  }
}
