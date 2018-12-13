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
      var labelForSheet = Preferences.getLabelNameForSheet(sheetId);
      if (labelForSheet) {
        ret.push(labelForSheet);
      }
    });
    ret.sort();
    return ret;
  }
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