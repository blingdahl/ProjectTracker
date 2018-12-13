var Label = {};
Label.initialized = false;

Label.init = function() {
  if (Label.initialized) {
    return;
  }
  
  log(Log.Level.INFO, 'Label.init()');
  
  Label.initialized = true;
  
  Label.getUserDefined = function(labelName, createIfNonexistent) {
    var label = GmailApp.getUserLabelByName(labelName);
    if (!label && createIfNonexistent) {
      label = GmailApp.createLabel(labelName);
    }
    return label;
  }
  
  Label.labelProperty = function(sheetId) {
    return 'label:' + sheetId;
  }
  
  Label.setLabelForSheet = function(sheetId, label) {
    PropertiesService.getScriptProperties().setProperty(Label.labelProperty(sheetId), label);
  }
  
  Label.clearLabelForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Label.labelProperty(sheetId));
  }
  
  Label.getLabelForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Label.labelProperty(sheetId));
  }
  
  Label.maxThreadsProperty = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }
  
  Label.setMaxThreadsForSheet = function(sheetId, maxThreads) {
    logStart('setMaxThreadsForSheet', [sheetId, maxThreads]);
    PropertiesService.getScriptProperties().setProperty(Label.maxThreadsProperty(sheetId), maxThreads);
    logStop('setMaxThreadsForSheet', [sheetId, maxThreads]);
  }
  
  Label.clearMaxThreadsForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Label.maxThreadsProperty(sheetId));
  }
  
  Label.getMaxThreadsForSheet = function(sheetId) {
    logStart('getMaxThreadsForSheet', [sheetId]);
    var ret = parseInt(PropertiesService.getScriptProperties().getProperty(Label.maxThreadsProperty(sheetId))) || Label.DEFAULT_MAX_THREADS;
    logStop('getMaxThreadsForSheet', [sheetId]);
    log(Log.Level.INFO, ret);
    return ret;
  }
  
  Label.searchTerm = function(labelName) {
    return 'label:' + labelName.replace(' ', '-');
  }
  
  Label.getAllLabelNames = function() {
    var ret = [];
    var labels = GmailApp.getUserLabels(); 
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      ret.push(label.getName());
    }
    return ret;
  }
  
  Label.getSheetLabelNames = function() {
    var ret = [];
    SpreadsheetApp.getActive().getSheets().forEach(function(sheet) {
      var sheetId = sheet.getSheetId();
      var labelForSheet = Label.getLabelForSheet(sheetId);
      if (labelForSheet) {
        ret.push(labelForSheet);
      }
    });
    ret.sort();
    return ret;
  }
  
  Label.DEFAULT_MAX_THREADS = 50;
}
  
function labelProperty(sheetId) {
  logStart('labelProperty', [sheetId]);
  Label.init();
  return Label.labelProperty(sheetId);
  logStop('labelProperty', [sheetId]);
}

function setLabelForSheet(sheetId, label, maxThreads) {
  logStart('labelProperty', [sheetId, label, maxThreads]);
  Label.init();
  Label.setLabelForSheet(sheetId, label);
  Label.setMaxThreadsForSheet(sheetId, maxThreads);
  logStop('labelProperty', [sheetId, label, maxThreads]);
}

function clearLabelForSheet(sheetId) {
  logStart('clearLabelForSheet', [sheetId]);
  Label.init();
  Label.clearLabelForSheet(sheetId);
  logStop('clearLabelForSheet', [sheetId]);
}

function getLabelForSheet(sheetId) {
  logStart('getLabelForSheet', [sheetId]);
  Label.init();
  var ret = Label.getLabelForSheet(sheetId);
  logStop('getLabelForSheet', [sheetId]);
  return ret;
}

function getAllLabels() {
  logStart('getAllLabels', []);
  Label.init();
  var ret = JSON.stringify(Label.getAllLabelNames());
  logStop('getAllLabels', []);
  return ret;
}

function setMaxThreadsForSheet(sheetId, maxThreads) {
  logStart('setMaxThreadsForSheet', [sheetId, maxThreads]);
  Label.init();
  Label.setMaxThreadsForSheet(sheetId, maxThreads);
  logStop('setMaxThreadsForSheet', [sheetId, maxThreads]);
}

function clearMaxThreadsForSheet(sheetId) {
  logStart('clearMaxThreadsForSheet', [sheetId]);
  Label.init();
  Label.clearMaxThreadsForSheet(sheetId);
  logStop('clearMaxThreadsForSheet', [sheetId]);
}

function getMaxThreadsForSheet(sheetId) {
  logStart('getMaxThreadsForSheet', [sheetId]);
  Label.init();
  var ret = Label.getMaxThreadsForSheet(sheetId);
  logStop('getMaxThreadsForSheet', [sheetId]);
  return ret;
}