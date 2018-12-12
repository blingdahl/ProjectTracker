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
}

function getAllLabels() {
  Label.init();
  return JSON.stringify(Label.getAllLabelNames());
}