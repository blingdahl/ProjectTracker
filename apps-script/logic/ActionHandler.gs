var ActionHandler = {};
ActionHandler.initialized = false;

ActionHandler.init = function() {
  if (ActionHandler.initialized) {
    return;
  }
  
  TrackingSheet.init();
  GmailLabel.init();
  Log.info('ActionHandler.init()');
  
  ActionHandler.initialized = true;

  ActionHandler.GMAIL_ACTIONS_IN_INBOX = ['Archive',
                                          'Unlabel',
                                          'Archive,Unlabel'];
  
  ActionHandler.GMAIL_ACTIONS_ARCHIVED = ['Unlabel',
                                          'Inbox'];
  
  ActionHandler.getGmailActions = function(otherLabelNames, thread) {
    var actions = [];
    if (thread.isInInbox()) {
      actions = actions.concat(ActionHandler.GMAIL_ACTIONS_IN_INBOX);
    } else {
      actions = actions.concat(ActionHandler.GMAIL_ACTIONS_ARCHIVED);
    }
    otherLabelNames.forEach(function(otherLabelName) { actions.push('Move to ' + otherLabelName); });
    return actions;
  }
  
  ActionHandler.archive = function(rowMutation, thread) {
    if (thread.isInInbox()) {
      thread.moveToArchive();
      rowMutation.addScriptNote('Archived');
      rowMutation.clearAction();
    }
  }
  
  ActionHandler.inbox = function(rowMutation, thread) {
    if (!thread.isInInbox()) {
      thread.moveToInbox();
      rowMutation.addScriptNote('Moved to inbox');
      rowMutation.clearAction();
    }
  }
  
  ActionHandler.removeLabel = function(rowMutation, thread, label) {
    var threadLabels = thread.getLabels();
    var labelRemoved = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        thread.removeLabel(threadLabel);
        rowMutation.addScriptNote('Removed label');
        rowMutation.removeRow();
        labelRemoved = true;
      }
    });
    if (!labelRemoved) {
      rowMutation.addScriptNote('Label not there');
    }
  }
  
  ActionHandler.markCompleted = function(rowMutation, thread) {
    if (thread) {
      thread.addLabel(GmailLabel.NO_TRACK);
      rowMutation.addScriptNote('Stopped tracking');
    } else {
      rowMutation.addScriptNote('Marked completed');
    }
    rowMutation.clearAction();
    rowMutation.removeRow();
  }
  
  ActionHandler.markObsolete = function(rowMutation, thread) {
    if (thread) {
      thread.addLabel(GmailLabel.NO_TRACK);
      rowMutation.addScriptNote('Stopped tracking');
    } else {
      rowMutation.addScriptNote('Marked obsolete');
    }
    rowMutation.clearAction();
    rowMutation.removeRow();
  }
  
  ActionHandler.changeLabel = function(rowMutation, thread, existingLabel, newLabel) {
    thread.addLabel(newLabel);
    thread.removeLabel(existingLabel);
    rowMutation.addScriptNote('Changed label');
    rowMutation.clearAction();
    rowMutation.removeRow();
  }
  
  ActionHandler.processActions = function(actionsStr, thread, label) {
    var actions = actionsStr.split(',');
    var rowMutation = new RowUpdate.Mutation();
    for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
      var action = actions[actionIndex];
      if (action === '') {
        continue;
      }
      Log.info('Action: ' + action);
      if (action === 'Archive') {
        ActionHandler.archive(rowMutation, thread);
      } else if (action === 'Completed') {
        ActionHandler.markCompleted(rowMutation, thread);
      } else if (action === 'Obsolete') {
        ActionHandler.markCompleted(rowMutation, thread);
      } else if (action === 'Unlabel') {
        ActionHandler.removeLabel(rowMutation, thread, label);
      } else if (action === 'Inbox') {
        ActionHandler.inbox(rowMutation, thread);
      } else if (action) {
        if (action.startsWith('Move to ')) {
          var newLabelName = action.substring('Move to '.length);
          var newLabel = GmailLabel.getUserDefined(newLabelName);
          if (newLabel) {
            ActionHandler.changeLabel(rowMutation, thread, label, newLabel);
          } else {
            rowMutation.addScriptNote('Unknown Label: ' + newLabelName);
          }
        } else {
          rowMutation.addScriptNote('Unknown Action: ' + action);
        }
      }
    }
    return rowMutation;
  }
}
