var RowUpdate = {};
RowUpdate.initialized = false;

RowUpdate.init = function() {
  if (RowUpdate.initialized) {
    return;
  }
  
  TrackingSheet.init();
  GmailLabel.init();
  Log.info('RowUpdate.init()');
  
  RowUpdate.initialized = true;
  
  RowUpdate.Mutation = function() {
    this.scriptNotes = [];
    this.shouldRemove = false;
    this.shouldClearAction = false;
  }
  
  RowUpdate.Mutation.prototype.addScriptNote = function(newNote) {
    this.scriptNotes.push(newNote);
  }
  
  RowUpdate.Mutation.prototype.hasScriptNotes = function() {
    return this.scriptNotes.length > 0;
  }
  
  RowUpdate.Mutation.prototype.getScriptNotes = function() {
    return this.scriptNotes.join('; ');
  }
  
  RowUpdate.Mutation.prototype.removeRow = function() {
    this.shouldRemove = true;
  }
  
  RowUpdate.Mutation.prototype.getShouldRemove = function() {
    return this.shouldRemove;
  }
  
  RowUpdate.Mutation.prototype.clearAction = function() {
    this.shouldClearAction = true;
  }
  
  RowUpdate.Mutation.prototype.getShouldClearAction = function() {
    return this.shouldClearAction;
  }
}
