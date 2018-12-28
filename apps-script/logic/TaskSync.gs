var TaskSync = {};
TaskSync.initialized = false;

TaskSync.init = function() {
  if (TaskSync.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('TaskSync.init()');
  
  TaskSync.initialized = true;
  
  TaskSync.getTasklist = function(trackingSheet) {
    var tasklistTitle = trackingSheet.getSheetName();
    var tasklistId = Preferences.getTasklistForSheet(trackingSheet.getSheetId());
    if (tasklistId) {
      try {
        var tasklist = Tasks.Tasklists.get(tasklistId);
        if (tasklist) {
          if (tasklist.title != tasklistTitle) {
            tasklist.title = tasklistTitle;
            Tasks.Tasklists.update(tasklist, tasklist.id);
          }
          return tasklist;
        }
      } catch (e) {}
    }
    Log.info('Creating ' + tasklistTitle);
    var newTasklist = Tasks.Tasklists.insert({
      title: tasklistTitle
    });
    Preferences.setTasklistForSheet(trackingSheet.getSheetId(), newTasklist.id);
    return newTasklist;
  }
  
  TaskSync.createTask = function(title, notes, tasklistId) {
    Log.info('Creating ' + title);
    return Tasks.Tasks.insert({
      title: title,
      notes: notes
    }, tasklistId);
  }
  
  TaskSync.makeTitleForRow = function(dataRow) {
    return ['[',
            dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY),
            '] ',
            dataRow.getValue(TrackingSheet.COLUMNS.ITEM)
           ].join('');
  }
  
  TaskSync.makeNotesForRow = function(dataRow) {
    var parts = [];
    var email = dataRow.getLinkUrl(TrackingSheet.COLUMNS.EMAIL);
    if (email) {
      parts.push(['Email: ', email].join(''));
    }
    var link = dataRow.getLinkUrl(TrackingSheet.COLUMNS.LINK);
    if (link) {
      parts.push(['Link: ', link].join(''));
    }
    return parts.join('\n');
  }
  
  TaskSync.sync = function(trackingSheet) {
    var tasklist = TaskSync.getTasklist(trackingSheet);
    var dataRowsByPriority = trackingSheet.getRowsByPriority();
    if (dataRowsByPriority.length === 0) {
      if (tasklist !== null) {
        Tasks.Tasklists.remove(tasklist.id);
      }
      return;
    }
    var tasks = Tasks.Tasks.list(tasklist.id, {showDeleted: true, showHidden: true}).items;
    var tasksById = {};
    var unvisitedTaskIds = {};
    if (tasks) {
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        tasksById[task.id] = task;
        unvisitedTaskIds[task.id] = true;
        Log.info('tracking task: ' + task);
      }
    }
    TrackingSheet.PRIORITIES.concat(['']).reverse().forEach(function(priority) {
      var dataRows = dataRowsByPriority[priority];
      if (dataRows === undefined) {
        Log.info('Nothing for ' + priority);
        return;
      }
      Log.info('Something for ' + priority + ': ' + dataRows);
      var lastTaskId = null;
      for (var i = 0; i < dataRows.length; i++) {
        var dataRow = dataRows[i];
        var taskTitle = TaskSync.makeTitleForRow(dataRow);
        var taskNotes = TaskSync.makeNotesForRow(dataRow);
        var taskId = dataRow.getValue(TrackingSheet.COLUMNS.TASK_ID);
        delete unvisitedTaskIds[taskId];
        if (taskId) {
          Log.info('taskId: ' + taskId);
          var task = tasksById[taskId];
          if (task) {
            if (taskTitle != task.title || taskNotes != task.notes) {
              task.title = taskTitle;
              task.notes = taskNotes;
              Tasks.Tasks.update(task, tasklist.id, taskId);
            }
            if (task.status === 'completed') {
              dataRow.setValue(TrackingSheet.COLUMNS.ACTION, 'Completed');
            }
          } else {
            Log.info('Task not found: ' + taskId + ' (' + taskTitle + ')');
            var taskId = TaskSync.createTask(taskTitle, taskNotes, tasklist.id).id;
            dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, taskId);
          }
        } else {
          Log.info('Adding task for ' + taskTitle);
          var taskId = TaskSync.createTask(taskTitle, taskNotes, tasklist.id).id;
          dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, taskId);
        }
        if (lastTaskId) {
          Tasks.Tasks.move(tasklist.id, taskId, {previous: lastTaskId});
        }
        lastTaskId = taskId;
      }
    });

    var unvisitedTaskIds = Object.keys(unvisitedTaskIds);
    for (var i = 0; i < unvisitedTaskIds.length; i++) {
      Tasks.Tasks.remove(tasklist.id, unvisitedTaskIds[i]);
    }
  }
}