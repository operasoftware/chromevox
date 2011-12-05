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
 * @fileoverview Bridge that sends earcon messages from content scripts or
 * other pages to the main background page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.Earcons');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ExtensionBridge');

/**
 * @constructor
 * @extends {cvox.AbstractEarcons}
 */
cvox.Earcons = function() {
  cvox.AbstractEarcons.call(this);
};
goog.inherits(cvox.Earcons, cvox.AbstractEarcons);

/**
 * Plays the specified earcon.
 * @param {number} earcon The earcon to be played.
 */
cvox.Earcons.prototype.playEarcon = function(earcon) {
  cvox.Earcons.superClass_.playEarcon.call(this, earcon);
  cvox.ExtensionBridge.send({
                              'target': 'EARCON',
                              'action': 'play',
                              'earcon': earcon});
};
