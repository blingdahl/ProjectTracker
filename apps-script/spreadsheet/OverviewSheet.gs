var OverviewSheet = {};
OverviewSheet.initialized = false;

OverviewSheet.init = function() {
  if (OverviewSheet.initialized) {
    return;
  }
  
  Spreadsheet.init();
  TrackingSheet.init();
  Log.info('OverviewSheet.init()');

  OverviewSheet.COLUMNS = new Spreadsheet.ColumnDefinitions()
      .addColumn('SHEET', 'Sheet')
      .addColumn('ITEM', 'Item')
      .addColumn('PRIORITY', 'Priority')
      .addColumn('STATUS', 'Status')
      .addColumn('EMAIL', 'Email')
      .addColumn('LINK', 'Link')
      .addColumn('NOTES', 'Notes')
      .addColumn('SCRIPT_NOTES', 'Script Notes');
  
  OverviewSheet.initialized = true;
  
  OverviewSheet.Sheet = function(sheet) {
    Spreadsheet.Sheet.call(this, sheet, OverviewSheet.COLUMNS);
  }
  OverviewSheet.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
  
  OverviewSheet.Sheet.prototype.addRowFromTrackingRow = function(sheetFormula, trackingRow) {
    var overviewRow = this.addRow();
    function copyFromTrackingRow(trackingColumnName, overviewColumnName) {
      overviewRow.setValue(overviewColumnName, trackingRow.getValue(trackingColumnName));
    };
    function copyFormulaFromTrackingRow(trackingColumnName, overviewColumnName) {
      overviewRow.setFormula(overviewColumnName, trackingRow.getFormula(trackingColumnName));
    };
    copyFromTrackingRow(TrackingSheet.COLUMNS.PRIORITY, OverviewSheet.COLUMNS.PRIORITY);
    copyFromTrackingRow(TrackingSheet.COLUMNS.ITEM, OverviewSheet.COLUMNS.ITEM);
    copyFromTrackingRow(TrackingSheet.COLUMNS.STATUS, OverviewSheet.COLUMNS.STATUS);
    copyFromTrackingRow(TrackingSheet.COLUMNS.NOTES, OverviewSheet.COLUMNS.NOTES);
    copyFormulaFromTrackingRow(TrackingSheet.COLUMNS.LINK, OverviewSheet.COLUMNS.LINK);
    copyFormulaFromTrackingRow(TrackingSheet.COLUMNS.EMAIL, OverviewSheet.COLUMNS.EMAIL);
    overviewRow.setFormula(OverviewSheet.COLUMNS.SHEET, sheetFormula);
  }
  
  OverviewSheet.Sheet.prototype.addRowsFromTrackingSheet = function(trackingSheet, priority) {
    if (trackingSheet.getSheetId() === this.getSheetId()) {
      Log.info('Not copying from overview');
      return;
    }
    Log.info('Adding ' + priority + ' from ' + trackingSheet.getSheetName());
    trackingSheet.getRowsForPriority(priority).forEach(function(trackingRow) {
      var sheetFormula = Spreadsheet.hyperlinkFormula(trackingSheet.getUrl(), trackingSheet.getSheetName());
      this.addRowFromTrackingRow(sheetFormula, trackingRow);
    }.bind(this));
  }
  
  OverviewSheet.get = function() {
    var sheet = Spreadsheet.getSpreadsheet().nativeSpreadsheet.getSheetByName('Overview');
    if (!sheet) {
      sheet = Spreadsheet.getSpreadsheet().nativeSpreadsheet.insertSheet('Overview');
    }
    return new OverviewSheet.Sheet(sheet);
  }
}
