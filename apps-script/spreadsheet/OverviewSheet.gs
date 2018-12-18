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
    copyFromTrackingRow(TrackingSheet.COLUMNS.LINK, OverviewSheet.COLUMNS.LINK);
    copyFormulaFromTrackingRow(TrackingSheet.COLUMNS.EMAIL, OverviewSheet.COLUMNS.EMAIL);
    overviewRow.setFormula(OverviewSheet.COLUMNS.SHEET, sheetFormula);
  }
  
  OverviewSheet.Sheet.prototype.addRowsFromTrackingSheet = function(trackingSheet, priority) {
    trackingSheet.getRowsForPriority(priority).forEach(function(trackingRow) {
      var sheetFormula = Spreadsheet.hyperlinkFormula(trackingSheet.getUrl(), trackingSheet.getSheetName());
      this.addRowFromTrackingRow(sheetFormula, trackingRow);
    }.bind(this));
  }
  
  OverviewSheet.get = function() {
    var sheet = Spreadsheet.getSpreadsheet().getSheetByName('Overview');
    if (!sheet) {
      sheet = Spreadsheet.getSpreadsheet().insertSheet('Overview');
    }
    return new OverviewSheet.Sheet(sheet);
  }
}
