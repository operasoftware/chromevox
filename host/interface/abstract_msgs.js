// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Defined the convenience function cvox.Msgs.getMsg.
 * @author deboer@google.com (James deBoer)
 */

goog.provide('cvox.AbstractMsgs');



/**
 * @constructor
 */
cvox.AbstractMsgs = function() { };


/**
 * Returns the message with the given message id.
 *
 * If we can't find a message, throw an exception.  This allows us to catch
 * typos early.
 *
 * @param {string} message_id The id.
 * @param {Array.<string>} opt_subs Substitution strings.
 * @return {string} The message.
 */
cvox.AbstractMsgs.prototype.getMsg = function(message_id, opt_subs) {
};
