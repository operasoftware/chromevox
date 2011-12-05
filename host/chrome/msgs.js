// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Defined the convenience function cvox.Msgs.getMsg.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.Msgs');
goog.require('cvox.AbstractMsgs');



/**
 * @constructor
 * @extends {cvox.AbstractMsgs}
 */
cvox.Msgs = function() {
  cvox.AbstractMsgs.call(this);
};
goog.inherits(cvox.Msgs, cvox.AbstractMsgs);


/**
 * The namespace for all Chromevox messages.
 * @type {string}
 * @const
 * @private
 */
cvox.Msgs.NAMESPACE_ = 'chromevox_';


/**
 * Returns the message with the given message id from the ChromeVox namespace.
 *
 * If we can't find a message, throw an exception.  This allows us to catch
 * typos early.
 *
 * @param {string} message_id The id.
 * @param {Array.<string>} opt_subs Substitution strings.
 * @return {string} The message.
 */
cvox.Msgs.prototype.getMsg = function(message_id, opt_subs) {
  var message = chrome.i18n.getMessage(
      cvox.Msgs.NAMESPACE_ + message_id, opt_subs);
  if (message == undefined || message == '') {
    throw new Error('Invalid ChromeVox message id: ' + message_id);
  }
  return message;
};


/**
 * Processes an HTML DOM the text of "i18n" elements with translated messages.
 * This function expects HTML elements with a i18n clean and a msgid attribute.
 *
 * @param {Node} root The root node where the translation should be performed.
 */
cvox.Msgs.prototype.addTranslatedMessagesToDom = function(root) {
  var elts = root.querySelectorAll('.i18n');
  for (var i = 0; i < elts.length; i++) {
    elts[i].textContent = this.getMsg(elts[i].getAttribute('msgid'));
  }
};
