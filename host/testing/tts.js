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
 * @fileoverview Dummy implementation of TTS for testing.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.TestTts');

goog.require('cvox.AbstractTts');
goog.require('cvox.DomUtil');
goog.require('cvox.HostFactory');



/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.TestTts = function() {
  cvox.AbstractTts.call(this);
  this.utterances_ = [];
};
goog.inherits(cvox.TestTts, cvox.AbstractTts);


/**
 * @type {string}
 * @private
 */
cvox.TestTts.prototype.sentinelText_ = '@@@STOP@@@';


/**
 * @override
 */
cvox.TestTts.prototype.speak = function(text, queueMode, opt_properties) {
  this.utterances_.push({text: text, queueMode: queueMode});
  if (opt_properties && opt_properties['endCallback'] != undefined) {
    var len = this.utterances_.length;
    // 'After' is a sentinel value in the tests that tells TTS to stop and
    // ends callbacks being called.
    if (this.utterances_[len - 1].text !=
        this.sentinelText_) {
      opt_properties['endCallback']();
    }
  }
};


/**
 * Creates a sentinel element that indicates when TTS should stop and callbacks
 * should stop being called.
 * @return {Element} The sentinel element.
 */
cvox.TestTts.prototype.createSentinel = function() {
  var sentinel = document.createElement('div');
  sentinel.textContent = this.sentinelText_;
  return sentinel;
};


/**
 * All calls to tts.speak are saved in an array of utterances.
 * Clear any utterances that were saved up to this point.
 */
cvox.TestTts.prototype.clearUtterances = function() {
  this.utterances_.length = 0;
};

/**
 * Return a string of what was spoken by tts.speak().
 * @return {string} A single string containing all utterances spoken
 *     since initialization or the last call to clearUtterances,
 *     concatenated together with all whitespace collapsed to single
 *     spaces.
 */
cvox.TestTts.prototype.getUtterancesAsString = function() {
  return cvox.DomUtil.collapseWhitespace(this.getUtteranceList().join(' '));
};

/**
 * Return a list of strings of what was spoken by tts.speak().
 * @return {Array.<string>} A list of all utterances spoken since
 *     initialization or the last call to clearUtterances.
 */
cvox.TestTts.prototype.getUtteranceList = function() {
  var result = [];
  for (var i = 0; i < this.utterances_.length; i++) {
    result.push(this.utterances_[i].text);
  }
  return result;
};

/**
 * Return a list of strings of what was spoken by tts.speak().
 * @return {Array.<{text: string, queueMode: number}>}
 *     A list of info about all utterances spoken since
 *     initialization or the last call to clearUtterances.
 */
cvox.TestTts.prototype.getUtteranceInfoList = function() {
  return this.utterances_;
};

cvox.HostFactory.ttsConstructor = cvox.TestTts;
