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
 * @fileoverview Braille for Android.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.AndroidBraille');

goog.require('cvox.AbstractBraille');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractBraille}
 */
cvox.AndroidBraille = function() {
  goog.base(this);
};
goog.inherits(cvox.AndroidBraille, cvox.AbstractBraille);

/** @override */
cvox.AndroidBraille.prototype.write = function(params) {
  // Only attempt to send to Braille if this interface exists.
  if (accessibility.braille) {
    accessibility.braille(JSON.stringify(params.toJson()));
  }
};

/** @override */
cvox.AndroidBraille.prototype.setCommandListener = function(func) {
  // This is not needed on Android since it will be handled by BrailleBack.
};

/** Export platform constructor. */
cvox.HostFactory.brailleConstructor = cvox.AndroidBraille;
