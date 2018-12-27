var TaskSync = {};
TaskSync.initialized = false;

TaskSync.init = function() {
  if (TaskSync.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('TaskSync.init()');
  
  TaskSync.initialized = true;
  
  TaskSync.getTasklist = function(trackingSheet, priority, createIfNeeded) {
    var tasklistTitle = priority + ': ' + trackingSheet.getSheetName();
    var allTasklists = Tasks.Tasklists.list().items;
    var matchingTasklists = [];
    for (var i = 0; i < allTasklists.length; i++) {
      var tasklist = allTasklists[i];
      if (tasklist.title === tasklistTitle) {
        matchingTasklists.push(tasklist);
      }
    }
    if (matchingTasklists.length === 1) {
      Log.info('Returning ' + tasklistTitle);
      return matchingTasklists[0];
    }
    if (matchingTasklists.length > 1) {
      Log.info('Too many lists ' + tasklistTitle);
      throw new Error('Too many matching lists for ' + tasklistTitle);
    }
    if (!createIfNeeded) {
      return null;
    }
    Log.info('Creating ' + tasklistTitle);
    return Tasks.Tasklists.insert({
      title: tasklistTitle
    });
  }
  
  TaskSync.createTask = function(title, tasklistId) {
    Log.info('Creating ' + title);
    return Tasks.Tasks.insert({
      title: title
    }, tasklistId);
  }
  
  TaskSync.makeTitleForRow = function(dataRow) {
    var titleParts = [dataRow.getValue(TrackingSheet.COLUMNS.PRIORITY), ': ', dataRow.getValue(TrackingSheet.COLUMNS.ITEM)];
    var email = dataRow.getLinkUrl(TrackingSheet.COLUMNS.EMAIL);
    if (email) {
      titleParts.push('; Email: ');
      titleParts.push(email);
    }
    var link = dataRow.getLinkUrl(TrackingSheet.COLUMNS.LINK);
    if (link) {
      titleParts.push('; Link: ');
      titleParts.push(link);
    }
    return titleParts.join('');
  }
  
  TaskSync.syncForPriority = function(trackingSheet, priority) {
    var dataRows = trackingSheet.getRowsForPriority(priority);
    var tasklist;
    var tasklist = TaskSync.getTasklist(trackingSheet, priority, dataRows.length !== 0);
    if (dataRows.length === 0) {
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
    for (var i = 0; i < dataRows.length; i++) {
      var dataRow = dataRows[i];
      var taskTitle = TaskSync.makeTitleForRow(dataRow);
      var taskId = dataRow.getValue(TrackingSheet.COLUMNS.TASK_ID);
      delete unvisitedTaskIds[taskId];
      if (taskId) {
        Log.info('taskId: ' + taskId);
        var task = tasksById[taskId];
        if (task) {
          if (taskTitle != task.title) {
            task.title = taskTitle;
            Tasks.Tasks.update(task, tasklist.id, taskId);
          }
          if (task.status === 'completed') {
            dataRow.setValue(TrackingSheet.COLUMNS.ACTION, 'Completed');
          }
        } else {
          Log.info('Task not found: ' + taskId + ' (' + taskTitle + ')');
          dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, TaskSync.createTask(taskTitle, tasklist.id).id);
        }
      } else {
        dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, TaskSync.createTask(taskTitle, tasklist.id).id);
      }
    }
    var unvisitedTaskIds = Object.keys(unvisitedTaskIds);
    for (var i = 0; i < unvisitedTaskIds.length; i++) {
      Tasks.Tasks.remove(tasklist.id, unvisitedTaskIds[i]);
    }
  }
  
  TaskSync.sync = function(trackingSheet) {
    TaskSync.syncForPriority(trackingSheet, 'P0');
    TaskSync.syncForPriority(trackingSheet, 'P1');
    TaskSync.syncForPriority(trackingSheet, 'P2');
  }
}