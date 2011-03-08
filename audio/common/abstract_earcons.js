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
 * @fileoverview Base class for implementing earcons.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractEarcons');

goog.require('cvox.AbstractLogger');

/**
 * @constructor
 * @extends {cvox.AbstractLogger}
 */
cvox.AbstractEarcons = function() {
  //Inherit AbstractLogger
  cvox.AbstractLogger.call(this);
};
goog.inherits(cvox.AbstractEarcons, cvox.AbstractLogger);

/**
 * Plays the specified earcon sound.
 * @param {number} earcon An earcon index.
 */
cvox.AbstractEarcons.prototype.playEarcon = function(earcon) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] playEarcon(' +
        this.getEarconName(earcon) + ')');
  }
};

/**
 * @param {number} earcon An earcon index.
 * @return {string} The readable earcon name.
 */
cvox.AbstractEarcons.prototype.getEarconName = function(earcon) {
  if (!this.earconNames) {
    this.earconNames = new Array();
    this.earconNames.push('ALERT_MODAL');
    this.earconNames.push('ALERT_NONMODAL');
    this.earconNames.push('BULLET');
    this.earconNames.push('BUSY_PROGRESS_LOOP');
    this.earconNames.push('BUSY_WORKING_LOOP');
    this.earconNames.push('BUTTON');
    this.earconNames.push('CHECK_OFF');
    this.earconNames.push('CHECK_ON');
    this.earconNames.push('COLLAPSED');
    this.earconNames.push('EDITABLE_TEXT');
    this.earconNames.push('ELLIPSIS');
    this.earconNames.push('EXPANDED');
    this.earconNames.push('FONT_CHANGE');
    this.earconNames.push('INVALID_KEYPRESS');
    this.earconNames.push('LINK');
    this.earconNames.push('LISTBOX');
    this.earconNames.push('LIST_ITEM');
    this.earconNames.push('NEW_MAIL');
    this.earconNames.push('OBJECT_CLOSE');
    this.earconNames.push('OBJECT_DELETE');
    this.earconNames.push('OBJECT_DESELECT');
    this.earconNames.push('OBJECT_OPEN');
    this.earconNames.push('OBJECT_SELECT');
    this.earconNames.push('PARAGRAPH_BREAK');
    this.earconNames.push('SEARCH_HIT');
    this.earconNames.push('SEARCH_MISS');
    this.earconNames.push('SECTION');
    this.earconNames.push('TASK_SUCCESS');
    this.earconNames.push('WRAP');
    this.earconNames.push('WRAP_EDGE');
  }
  return this.earconNames[earcon];
};

/**
 * @type {number}
 */
cvox.AbstractEarcons.ALERT_MODAL = 0;

/**
 * @type {number}
 */
cvox.AbstractEarcons.ALERT_NONMODAL = 1;

/**
 * @type {number}
 */
cvox.AbstractEarcons.BULLET = 2;

/**
 * @type {number}
 */
cvox.AbstractEarcons.BUSY_PROGRESS_LOOP = 3;

/**
 * @type {number}
 */
cvox.AbstractEarcons.BUSY_WORKING_LOOP = 4;

/**
 * @type {number}
 */
cvox.AbstractEarcons.BUTTON = 5;

/**
 * @type {number}
 */
cvox.AbstractEarcons.CHECK_OFF = 6;

/**
 * @type {number}
 */
cvox.AbstractEarcons.CHECK_ON = 7;

/**
 * @type {number}
 */
cvox.AbstractEarcons.COLLAPSED = 8;

/**
 * @type {number}
 */
cvox.AbstractEarcons.EDITABLE_TEXT = 9;

/**
 * @type {number}
 */
cvox.AbstractEarcons.ELLIPSIS = 10;

/**
 * @type {number}
 */
cvox.AbstractEarcons.EXPANDED = 11;

/**
 * @type {number}
 */
cvox.AbstractEarcons.FONT_CHANGE = 12;

/**
 * @type {number}
 */
cvox.AbstractEarcons.INVALID_KEYPRESS = 13;

/**
 * @type {number}
 */
cvox.AbstractEarcons.LINK = 14;

/**
 * @type {number}
 */
cvox.AbstractEarcons.LISTBOX = 15;

/**
 * @type {number}
 */
cvox.AbstractEarcons.LIST_ITEM = 16;

/**
 * @type {number}
 */
cvox.AbstractEarcons.NEW_MAIL = 17;

/**
 * @type {number}
 */
cvox.AbstractEarcons.OBJECT_CLOSE = 18;

/**
 * @type {number}
 */
cvox.AbstractEarcons.OBJECT_DELETE = 18;

/**
 * @type {number}
 */
cvox.AbstractEarcons.OBJECT_DESELECT = 20;

/**
 * @type {number}
 */
cvox.AbstractEarcons.OBJECT_OPEN = 21;

/**
 * @type {number}
 */
cvox.AbstractEarcons.OBJECT_SELECT = 22;

/**
 * @type {number}
 */
cvox.AbstractEarcons.PARAGRAPH_BREAK = 23;

/**
 * @type {number}
 */
cvox.AbstractEarcons.SEARCH_HIT = 24;

/**
 * @type {number}
 */
cvox.AbstractEarcons.SEARCH_MISS = 25;

/**
 * @type {number}
 */
cvox.AbstractEarcons.SECTION = 26;

/**
 * @type {number}
 */
cvox.AbstractEarcons.TASK_SUCCESS = 27;

/**
 * @type {number}
 */
cvox.AbstractEarcons.WRAP = 28;

/**
 * @type {number}
 */
cvox.AbstractEarcons.WRAP_EDGE = 29;
