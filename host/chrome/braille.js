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
 * @fileoverview Bridge that sends Braille messages from content scripts or
 * other pages to the main background page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeBraille');

goog.require('cvox.AbstractBraille');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractBraille}
 */
cvox.ChromeBraille = function() {
  cvox.AbstractBraille.call(this);
};
goog.inherits(cvox.ChromeBraille, cvox.AbstractBraille);

/** @override */
cvox.ChromeBraille.prototype.write = function(textString) {
  cvox.ChromeBraille.superClass_.write.call(this, textString);

  var message = {'target': 'BRAILLE',
                 'action': 'write',
                 'text': textString};

  cvox.ExtensionBridge.send(message);
};

/** @override */
cvox.ChromeBraille.prototype.setPanOutListener = function(func) {
  cvox.ChromeBraille.superClass_.setPanOutListener.call(this, func);
  // TODO (clchen, plundblad): Implement this.
};

