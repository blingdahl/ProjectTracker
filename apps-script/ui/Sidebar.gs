function showPreferencesSidebar() {
  Log.start('showPreferencesSidebar', []);
  Tracking.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/SidebarUi');
  template.spreadsheetUrl = SpreadsheetApp.getActive().getUrl();
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setWidth(400).setTitle('Project Tracker'));
  Log.stop('showPreferencesSidebar', []);
}