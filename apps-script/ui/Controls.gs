function renderControls(sheets) {
  var template = HtmlService.createTemplateFromFile('ui/ControlsUi');
  template.sheets = sheets;
  return template.evaluate().getContent();
}
