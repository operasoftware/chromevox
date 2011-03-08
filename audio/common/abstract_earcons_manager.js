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
 * @fileoverview This is the base class responsible for earcons management.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractEarconsManager');

goog.require('cvox.AbstractEarcons');

/**
 * @constructor
 * @extends {cvox.AbstractEarcons}
 */
cvox.AbstractEarconsManager = function() {
  //Inherit AbstractEarcons
  cvox.AbstractEarcons.call(this);
};
goog.inherits(cvox.AbstractEarconsManager, cvox.AbstractEarcons);

/**
 * Switch to the next earcon set and optionally announce its name.
 * If no earcon sets have been specified this function is a NOOP.
 * @param {boolean} announce If true, will announce the name of the
 *     new earcon set.
 */
cvox.AbstractEarconsManager.prototype.nextEarcons = function(announce) {
  // TODO(svetoslavganov): Figure out if the user should be able to switch
  // earcons and if not remove this method.
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] nextEarcons(' + announce + ')');
  }
};
