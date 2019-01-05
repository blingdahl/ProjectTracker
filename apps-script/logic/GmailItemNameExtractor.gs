var GmailItemNameExtractor = {};

GmailItemNameExtractor.extractItemNameFromBody = function(body) {
  return body;
}

GmailItemNameExtractor.extractItemName = function(thread) {
  return GmailExtractor.extractSubject(thread) || GmailItemNameExtractor.extractItemNameFromBody(GmailExtractor.extractBody(thread));
}
