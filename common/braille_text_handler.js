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

goog.provide('cvox.BrailleTextHandler');

goog.require('cvox.EditableTextAreaShadow');
goog.require('cvox.TextHandlerInterface');

/**
 * @fileoverview Updates braille display contents following text changes.
 *
 * @author jbroman@google.com (Jeremy Roman)
 */

/**
 * Represents an editable text region.
 *
 * @constructor
 * @implements {cvox.TextHandlerInterface}
 * @param {!cvox.BrailleInterface} braille Braille interface.
 * @param {!cvox.NavigationManager} navigationManager Current nav manager.
 */
cvox.BrailleTextHandler = function(braille, navigationManager) {
  /**
   * Braille interface used to produce output.
   * @type {!cvox.BrailleInterface}
   * @private
   */
  this.braille_ = braille;

  /**
   * Navigation manager. Used to update braille display based on current focus.
   * @type {!cvox.NavigationManager}
   * @private
   */
  this.navigationManager_ = navigationManager;
};

/** @override */
cvox.BrailleTextHandler.prototype.update = function(triggeredByUser) {
  var content = this.navigationManager_.getBraille();
  this.braille_.write(content);
};
