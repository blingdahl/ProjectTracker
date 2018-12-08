var Overview = {};
Overview.initialized = false;

Overview.COLUMN_NAMES = {'NOTES': 'Notes',
                         'ITEM': 'Item',
                         'STATUS': 'Status',
                         'EMAIL': 'Email',
                         'LINK': 'Link',
                         'PRIORITY': 'Priority',
                         'SHEET': 'Sheet'};

Overview.COLUMNS = [Overview.COLUMN_NAMES.SHEET,
                    Overview.COLUMN_NAMES.ITEM,
                    Overview.COLUMN_NAMES.PRIORITY,
                    Overview.COLUMN_NAMES.EMAIL,
                    Overview.COLUMN_NAMES.LINK,
                    Overview.COLUMN_NAMES.NOTES,
                    Overview.COLUMN_NAMES.STATUS];

Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  OverviewSheet.init();
  log(Log.Level.INFO, 'Overview.init()');
  
  Overview.initialized = true;
  
	Overview.update = function() {
		log(Log.Level.INFO, 'Overview.update()');
		var overviewSheet = Overview.Sheet.get();
		overviewSheet.clearData();
		var trackingSheets = Tracking.Sheet.getAll();
		trackingSheets.forEach(function(trackingSheet) {
			if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
				return;
			}
			log(Log.Level.INFO, 'Adding P0 from ' + trackingSheet.getSheetName());
			overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P0');
		});
		trackingSheets.forEach(function(trackingSheet) {
			if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
				return;
			}
			log(Log.Level.INFO, 'Adding P1 from ' + trackingSheet.getSheetName());
			overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P1');
		});
		log(Log.Level.INFO, 'Updated overview');
	}
}

function updateOverview() {
  log(Log.Level.INFO, 'updateOverview');
  Overview.init();
  Overview.update();
}
