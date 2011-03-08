// Copyright 2010 Google Inc.
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
 * @fileoverview Base class for classes that can log their behavior.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractLogger');

/**
 * Creates a new instance.
 * @constructor
 */
cvox.AbstractLogger = function() {
  if (this.logEnabled()) {
    this.debuglog = new Array();
  }
};

/**
 * @return {string} The human-readable name of this instance.
 */
cvox.AbstractLogger.prototype.getName = function() {
  return 'AbstractLogger';
};

/**
 * @return {boolean} If logging is enabled.
 */
cvox.AbstractLogger.prototype.logEnabled = function() {
  return true;
};

/**
 * Debugging function - adds the string to the log of utterances.
 * @param {string} msgString The string of text to log.
 */
cvox.AbstractLogger.prototype.log = function(msgString) {
  if (!this.logEnabled()) {
    return;
  }
  this.debuglog.push(msgString);
  if (console) {
    console.log(msgString);
  }
};

/**
 * Debugging function - returns the log of utterances.
 * @return {Array} The log of utterances.
 */
cvox.AbstractLogger.prototype.getLog = function() {
  return this.debuglog;
};

/**
 * Debugging function - resets the log of utterances.
 */
cvox.AbstractLogger.prototype.resetLog = function() {
  this.debuglog = new Array();
};
