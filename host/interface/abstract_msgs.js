// Copyright 2013 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
 * Return the current locale.
 * @return {string} The locale.
 */
cvox.AbstractMsgs.prototype.getLocale = function() { };


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


/**
 * Retuns a number formatted correctly.
 *
 * @param {number} num The number.
 * @return {string} The number in the correct locale.
 */
cvox.AbstractMsgs.prototype.getNumber = function(num) {
};
