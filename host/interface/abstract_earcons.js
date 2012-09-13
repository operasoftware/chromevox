// Copyright 2012 Google Inc.
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
 * When adding earcons, please add them to getEarconName and getEarconId.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractEarcons');

/**
 * @constructor
 */
cvox.AbstractEarcons = function() {
};

/**
 * Plays the specified earcon sound.
 * @param {number} earcon An earcon index.
 */
cvox.AbstractEarcons.prototype.playEarcon = function(earcon) {
  if (window['console']) {
    window['console']['log']('Earcon ' + this.getEarconName(earcon));
  }
};

/**
 * Plays the specified earcon sound, given the name of the earcon.
 * @param {string} earconName The name of the earcon.
 */
cvox.AbstractEarcons.prototype.playEarconByName = function(earconName) {
  this.playEarcon(this.getEarconId(earconName));
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
    this.earconNames.push('SELECTION');
    this.earconNames.push('SELECTION_REVERSE');
    this.earconNames.push('TASK_SUCCESS');
    this.earconNames.push('WRAP');
    this.earconNames.push('WRAP_EDGE');
  }
  return this.earconNames[earcon];
};


/**
 * @param {string} earconName An earcon name.
 * @return {number} The earcon ID.
 */
cvox.AbstractEarcons.prototype.getEarconId = function(earconName) {
  if (!this.earconNamesToIds) {
    this.earconNamesToIds = new Object();
    this.earconNamesToIds['ALERT_MODAL'] = cvox.AbstractEarcons.ALERT_MODAL;
    this.earconNamesToIds['ALERT_NONMODAL'] =
        cvox.AbstractEarcons.ALERT_NONMODAL;
    this.earconNamesToIds['BULLET'] = cvox.AbstractEarcons.BULLET;
    this.earconNamesToIds['BUSY_PROGRESS_LOOP'] =
        cvox.AbstractEarcons.BUSY_PROGRESS_LOOP;
    this.earconNamesToIds['BUSY_WORKING_LOOP'] =
        cvox.AbstractEarcons.BUSY_WORKING_LOOP;
    this.earconNamesToIds['BUTTON'] = cvox.AbstractEarcons.BUTTON;
    this.earconNamesToIds['CHECK_OFF'] = cvox.AbstractEarcons.CHECK_OFF;
    this.earconNamesToIds['CHECK_ON'] = cvox.AbstractEarcons.CHECK_ON;
    this.earconNamesToIds['COLLAPSED'] = cvox.AbstractEarcons.COLLAPSED;
    this.earconNamesToIds['EDITABLE_TEXT'] = cvox.AbstractEarcons.EDITABLE_TEXT;
    this.earconNamesToIds['ELLIPSIS'] = cvox.AbstractEarcons.ELLIPSIS;
    this.earconNamesToIds['EXPANDED'] = cvox.AbstractEarcons.EXPANDED;
    this.earconNamesToIds['FONT_CHANGE'] = cvox.AbstractEarcons.FONT_CHANGE;
    this.earconNamesToIds['INVALID_KEYPRESS'] =
        cvox.AbstractEarcons.INVALID_KEYPRESS;
    this.earconNamesToIds['LINK'] = cvox.AbstractEarcons.LINK;
    this.earconNamesToIds['LISTBOX'] = cvox.AbstractEarcons.LISTBOX;
    this.earconNamesToIds['LIST_ITEM'] = cvox.AbstractEarcons.LIST_ITEM;
    this.earconNamesToIds['NEW_MAIL'] = cvox.AbstractEarcons.NEW_MAIL;
    this.earconNamesToIds['OBJECT_CLOSE'] = cvox.AbstractEarcons.OBJECT_CLOSE;
    this.earconNamesToIds['OBJECT_DELETE'] = cvox.AbstractEarcons.OBJECT_DELETE;
    this.earconNamesToIds['OBJECT_DESELECT'] =
        cvox.AbstractEarcons.OBJECT_DESELECT;
    this.earconNamesToIds['OBJECT_OPEN'] = cvox.AbstractEarcons.OBJECT_OPEN;
    this.earconNamesToIds['OBJECT_SELECT'] = cvox.AbstractEarcons.OBJECT_SELECT;
    this.earconNamesToIds['PARAGRAPH_BREAK'] =
        cvox.AbstractEarcons.PARAGRAPH_BREAK;
    this.earconNamesToIds['SEARCH_HIT'] = cvox.AbstractEarcons.SEARCH_HIT;
    this.earconNamesToIds['SEARCH_MISS'] = cvox.AbstractEarcons.SEARCH_MISS;
    this.earconNamesToIds['SECTION'] = cvox.AbstractEarcons.SECTION;
    this.earconNamesToIds['SELECTION'] = cvox.AbstractEarcons.SELECTION;
    this.earconNamesToIds['SELECTION_REVERSE'] =
        cvox.AbstractEarcons.SELECTION_REVERSE;
    this.earconNamesToIds['TASK_SUCCESS'] = cvox.AbstractEarcons.TASK_SUCCESS;
    this.earconNamesToIds['WRAP'] = cvox.AbstractEarcons.WRAP;
    this.earconNamesToIds['WRAP_EDGE'] = cvox.AbstractEarcons.WRAP_EDGE;
  }
  return this.earconNamesToIds[earconName];
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
cvox.AbstractEarcons.OBJECT_DELETE = 19;

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
cvox.AbstractEarcons.SELECTION = 27;

/**
 * @type {number}
 */
cvox.AbstractEarcons.SELECTION_REVERSE = 28;

/**
 * @type {number}
 */
cvox.AbstractEarcons.TASK_SUCCESS = 29;

/**
 * @type {number}
 */
cvox.AbstractEarcons.WRAP = 30;

/**
 * @type {number}
 */
cvox.AbstractEarcons.WRAP_EDGE = 31;
