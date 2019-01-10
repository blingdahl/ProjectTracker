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
  
GmailExtractor.getFrom = function(thread) {
  var messages = thread.getMessages();
  if (messages.length === 0) {
    return '';
  }
  var from = messages[0].getFrom();
  if (from.indexOf('<') > 5) {
    from = from.substring(0, from.indexOf('<') - 1);
  }
  from = from.replace(/"/g, '');
  return from;
}
