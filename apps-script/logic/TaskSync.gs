var TaskSync = {};
TaskSync.initialized = false;

TaskSync.init = function() {
  if (TaskSync.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('TaskSync.init()');
  
  TaskSync.initialized = true;
  
  TaskSync.TaskSync = function(trackingSheet) {
    this.trackingSheet = trackingSheet;
    this.tasklist = this.getTasklist();
    this.tasks = Tasks.Tasks.list(this.tasklist.id, {showHidden: true, showCompleted: true}).items || [];
    Log.info(this.tasks);
    this.tasksById = indexMap(this.tasks, function(task) { return task.id; });
    this.copiedCompleted = false;
  }
  
  TaskSync.TaskSync.prototype.getTasklist = function() {
    var tasklistTitle = this.trackingSheet.getSheetName();
    var tasklistId = Preferences.getTasklistForSheet(this.trackingSheet.getSheetId());
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
    Preferences.setTasklistForSheet(this.trackingSheet.getSheetId(), newTasklist.id);
    return newTasklist;
  }
  
  TaskSync.TaskSync.prototype.createTask = function(title, notes) {
    Log.info('Creating ' + title);
    return Tasks.Tasks.insert({
      title: title,
      notes: notes
    }, this.tasklist.id);
  }
  
  TaskSync.TaskSync.prototype.makeTitleForRow = function(dataRow) {
    return ['[',
            dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY) || '?',
            '] ',
            dataRow.getValue(TrackingSheet.COLUMNS.ITEM)
           ].join('');
  }
  
  TaskSync.TaskSync.prototype.makeNotesForRow = function(dataRow) {
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
  
  TaskSync.TaskSync.prototype.syncToTasks = function() {
    Log.info('syncToTasks');
    var dataRowsByPriority = this.trackingSheet.getRowsByPriority();
    if (dataRowsByPriority.length === 0) {
      if (this.tasklist !== null) {
        Tasks.Tasklists.remove(this.tasklist.id);
      }
      return;
    }
    var unvisitedTaskIds = indexMap(this.tasks, function(task) { return task.id; });
    TrackingSheet.PRIORITIES.concat(['']).reverse().forEach(function(priority) {
      var dataRows = dataRowsByPriority[priority];
      if (dataRows === undefined) {
        Log.info('Nothing for ' + priority);
        return;
      }
      var lastTaskId = null;
      dataRows.forEach(function(dataRow) {
        var taskTitle = this.makeTitleForRow(dataRow);
        var taskNotes = this.makeNotesForRow(dataRow);
        var taskId = dataRow.getValue(TrackingSheet.COLUMNS.TASK_ID);
        delete unvisitedTaskIds[taskId];
        if (taskId) {
          Log.info('taskId: ' + taskId + ' (' + taskTitle + ')');
          var task = this.tasksById[taskId];
          if (task) {
            if (taskTitle != task.title || taskNotes != task.notes) {
              task.title = taskTitle;
              task.notes = taskNotes;
              Log.info('taskId: ' + taskId + ', tasklistId: ' + this.tasklist.id + ', task: ' + task);
              Tasks.Tasks.update(task, this.tasklist.id, taskId);
            }
          } else {
            Log.info('Task not found: ' + taskId + ' (' + taskTitle + ')');
            var taskId = this.createTask(taskTitle, taskNotes, lastTaskId, this.tasklist.id).id;
            Log.info('Added taskId: ' + taskId + '(' + taskTitle + ')');
            dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, taskId);
          }
        } else {
          var taskId = this.createTask(taskTitle, taskNotes, lastTaskId, this.tasklist.id).id;
          Log.info('Added taskId: ' + taskId + '(' + taskTitle + ')');
          dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, taskId);
        }
        if (false && lastTaskId) {
          Log.info('Moving ' + taskId + ' to after ' + lastTaskId);
          Tasks.Tasks.move(this.tasklist.id, taskId, {previous: lastTaskId});
        }
        lastTaskId = taskId;
      }.bind(this));
    }.bind(this));

    var unvisitedTaskIds = Object.keys(unvisitedTaskIds);
    for (var i = 0; i < unvisitedTaskIds.length; i++) {
      Tasks.Tasks.remove(this.tasklist.id, unvisitedTaskIds[i]);
    }
  }
  
  TaskSync.TaskSync.prototype.copyCompleted = function(trackingSheet) {
    Log.info('copyCompleted');
    if (this.copiedCompleted) {
      return;
    }
    var dataRows = this.trackingSheet.getDataRows();
    dataRows.forEach(function(dataRow) {
      var taskId = dataRow.getValue(TrackingSheet.COLUMNS.TASK_ID);
      if (taskId) {
        var task = this.tasksById[taskId];
        if (task != undefined) {
          if (task['status'] == 'completed') {
            dataRow.setValue(TrackingSheet.COLUMNS.ACTION, 'Completed');
          }
        }
      }
    }.bind(this));
    this.copiedCompleted = true;
  }
  
  TaskSync.forSheet = function(trackingSheet) {
    if (!TaskSync.objs[trackingSheet.getSheetId()]) {
      TaskSync.objs[trackingSheet.getSheetId()] = new TaskSync.TaskSync(trackingSheet)
    }
    return TaskSync.objs[trackingSheet.getSheetId()];
  }
  
  TaskSync.objs = {};
}
