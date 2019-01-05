var GmailExtractor = {};

GmailExtractor.extractSubject = function(thread) {
  return thread.getFirstMessageSubject();
}

GmailExtractor.extractBody = function(thread) {
  var messages = thread.getMessages();
  if (messages.length === 0) {
    return null;
  }
  return messages[0].getBody();
}
