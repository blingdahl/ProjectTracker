var TaskSync = {};
TaskSync.initialized = false;

TaskSync.init = function() {
  if (TaskSync.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('TaskSync.init()');
  
  TaskSync.initialized = true;
  
  TaskSync.getTaskList = function(trackingSheet, priority) {
    var tasklistTitle = priority + ': ' + trackingSheet.getSheetName();
    var tasklists = Tasks.Tasklists.list().items;
    for (var i = 0; i < tasklists.length; i++) {
      var tasklist = tasklists[i];
      if (tasklist.title === tasklistTitle) {
        return tasklist;
      }
    }
    tasklist = {
      title: tasklistTitle
    };
    return Tasks.Tasklists.insert(tasklist);
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
    var tasklist = TaskSync.getTaskList(trackingSheet, priority);
    if (dataRows.length === 0 && tasklist) {
      Tasks.Tasklists.remove(tasklist.id);
    }
    var tasks = Tasks.Tasks.list(tasklist.id).items;
    var tasksById = {};
    var unvisitedTaskIds = {};
    if (tasks) {
      for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        tasksById[task.id] = task;
        unvisitedTaskIds[task.id] = true;
      }
    }
    for (var i = 0; i < dataRows.length; i++) {
      var dataRow = dataRows[i];
      var taskTitle = TaskSync.makeTitleForRow(dataRow);
      var taskId = dataRow.getValue(TrackingSheet.COLUMNS.TASK_ID);
      delete unvisitedTaskIds[taskId];
      if (taskId) {
        var task = tasksById[taskId];
        Log.info(taskId);
        Log.info(task);
        if (taskTitle != task.title) {
          task.title = taskTitle;
          Tasks.Tasks.update(task, tasklist.id, taskId);
        }
        if (task.completed) {
          dataRow.setValue(TrackingSheet.COLUMNS.ACTION, 'Completed');
        }
      } else {
        var newTask = {
          title: taskTitle
        };
        var taskWithId = Tasks.Tasks.insert(newTask, tasklist.id);
        dataRow.setValue(TrackingSheet.COLUMNS.TASK_ID, taskWithId.id);
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