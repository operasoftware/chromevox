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
 * @fileoverview Sends Braille commands to the Braille API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.BrailleBackground');

goog.require('cvox.AbstractBraille');
goog.require('cvox.ChromeVox');

/**
 * @constructor
 * @extends {cvox.AbstractBraille}
 */
cvox.BrailleBackground = function() {
  goog.base(this);
};
goog.inherits(cvox.BrailleBackground, cvox.AbstractBraille);


/** @override */
cvox.BrailleBackground.prototype.write = function(params) {
  // To quickly prototype this, we will use a local http server that
  // will output to the Braille display.
  // TODO (clchen, plundblad): Replace this with the actual NaCl interface once
  // that is ready.
  var xhr = new XMLHttpRequest();
  xhr.overrideMimeType('text/xml');
  xhr.open('POST', 'http://127.0.0.1:8000', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('write=' + params);
};

/** @override */
cvox.BrailleBackground.prototype.setPanOutListener = function(func) {
  // TODO (clchen, plundblad): Implement this.
};
