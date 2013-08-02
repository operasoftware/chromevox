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
 * @fileoverview Bridge that sends earcon messages from content scripts or
 * other pages to the main background page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */


goog.provide('cvox.ChromeEarcons');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');


/**
 * @constructor
 * @extends {cvox.AbstractEarcons}
 */
cvox.ChromeEarcons = function() {
  goog.base(this);
};
goog.inherits(cvox.ChromeEarcons, cvox.AbstractEarcons);


/**
 * @override
 */
cvox.ChromeEarcons.prototype.playEarcon = function(earcon) {
  goog.base(this, 'playEarcon', earcon);
  if (!this.enabled) {
    return;
  }

  cvox.ExtensionBridge.send({
                              'target': 'EARCON',
                              'action': 'play',
                              'earcon': earcon});
};


/**
 * @override
 */
cvox.ChromeEarcons.prototype.toggle = function() {
  goog.base(this, 'toggle');
  cvox.ChromeVox.host.sendToBackgroundPage({
    'target': 'Prefs',
    'action': 'setPref',
    'pref': 'earcons',
    'value': this.enabled
  });
  if (!this.enabled) {
    cvox.ChromeVox.host.sendToBackgroundPage({
      'target': 'Prefs',
      'action': 'setPref',
      'pref': 'useVerboseMode',
      'value': true
    });
  }
  return this.enabled;
};


cvox.HostFactory.earconsConstructor = cvox.ChromeEarcons;
