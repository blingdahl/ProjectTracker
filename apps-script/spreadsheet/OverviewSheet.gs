var OverviewSheet = {};
OverviewSheet.initialized = false;

OverviewSheet.init = function() {
  if (OverviewSheet.initialized) {
    return;
  }
  
  Spreadsheet.init();
  TrackingSheet.init();
  log(Log.Level.INFO, 'OverviewSheet.init()');

  OverviewSheet.COLUMNS = new Spreadsheet.ColumnDefinitions()
      .addColumn('SHEET', 'Sheet')
      .addColumn('ITEM', 'Item')
      .addColumn('PRIORITY', 'Priority')
      .addColumn('EMAIL', 'Email')
      .addColumn('LINK', 'Link')
      .addColumn('NOTES', 'Notes')
      .addColumn('SCRIPT_NOTES', 'Script Notes');
  
  OverviewSheet.initialized = true;
  
  OverviewSheet.Sheet = function(sheet) {
    OverviewSheet.Sheet.call(this, sheet, OverviewSheet.Sheet.COLUMNS);
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
    copyFromTrackingRow(Tracking.COLUMN_NAMES.PRIORITY, Overview.COLUMN_NAMES.PRIORITY);
    copyFromTrackingRow(Tracking.COLUMN_NAMES.ITEM, Overview.COLUMN_NAMES.ITEM);
    copyFromTrackingRow(Tracking.COLUMN_NAMES.STATUS, Overview.COLUMN_NAMES.STATUS);
    copyFromTrackingRow(Tracking.COLUMN_NAMES.NOTES, Overview.COLUMN_NAMES.NOTES);
    copyFromTrackingRow(Tracking.COLUMN_NAMES.LINK, Overview.COLUMN_NAMES.LINK);
    copyFormulaFromTrackingRow(Tracking.COLUMN_NAMES.EMAIL, Overview.COLUMN_NAMES.EMAIL);
    overviewRow.setFormula(Overview.COLUMN_NAMES.SHEET, sheetFormula);
  }
  
  OverviewSheet.Sheet.prototype.addRowsFromTrackingSheet = function(trackingSheet, priority) {
    trackingSheet.getRowsForPriority(priority).forEach(function(trackingRow) {
      var sheetFormula = Spreadsheet.hyperlinkFormula(trackingSheet.getUrl(), trackingSheet.getSheetName());
      this.addRowFromTrackingRow(sheetFormula, trackingRow);
    }.bind(this));
  }
  
  OverviewSheet.Sheet.get = function() {
    var sheet = SpreadsheetApp.getActive().getSheetByName('Overview');
    if (!sheet) {
      sheet = SpreadsheetApp.getActive().insertSheet('Overview');
    }
    return new Overview.Sheet(sheet);
  }
}
