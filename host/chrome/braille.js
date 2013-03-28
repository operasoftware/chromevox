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
  goog.base(this);
};
goog.inherits(cvox.ChromeBraille, cvox.AbstractBraille);

/** @override */
cvox.ChromeBraille.prototype.write = function(params) {
  var outParams = params.toJson();
  // Hack to ensure text survives across the JSON stringify/parse and the
  // XMLHttpRequest.
  outParams.text = outParams.text.replace(/[\"\'&]/g, '');

  var message = {'target': 'BRAILLE',
                 'action': 'write',
                 'params': JSON.stringify(outParams)};

  cvox.ExtensionBridge.send(message);
};

/** @override */
cvox.ChromeBraille.prototype.setPanOutListener = function(func) {
  // TODO (clchen, plundblad): Implement this.
};

/** Export platform constructor. */
cvox.HostFactory.brailleConstructor = cvox.ChromeBraille;
