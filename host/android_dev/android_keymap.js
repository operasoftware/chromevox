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
 * @fileoverview Android-specific keymap.
 *
 * @author clchen@google.com (Charles L. Chen)
 */
goog.provide('cvox.AndroidKeyMap');

cvox.AndroidKeyMap = function() {
};


cvox.AndroidKeyMap.getStringifiedKeyMap = function() {
  return cvox.ChromeVoxJSON.stringify({
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[17]}}": "stopSpeech",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[9]}}": "handleTab",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[9]}}": "handleTabPrev",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[38]}}": "backward",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[40]}}": "forward",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[37]}}": "previousGranularity",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[39]}}": "nextGranularity",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[false],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[13]}}": "forceClickOnCurrentItem",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[false],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[40]}}": "readFromHere",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[85]}}": "readLinkURL",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[75]}}": "fullyDescribe",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[189]}}": "decreaseTtsPitch",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[187]}}": "increaseTtsPitch",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[219]}}": "decreaseTtsRate",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[221]}}": "increaseTtsRate",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[81]}}": "cyclePunctuationLevel",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[49]}}": "nextHeading1",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[49]}}": "previousHeading1",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[50]}}": "nextHeading2",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[50]}}": "previousHeading2",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[51]}}": "nextHeading3",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[51]}}": "previousHeading3",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[52]}}": "nextHeading4",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[52]}}": "previousHeading4",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[53]}}": "nextHeading5",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[53]}}": "previousHeading5",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[54]}}": "nextHeading6",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[54]}}": "previousHeading6",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[67]}}": "nextComboBox",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[67]}}": "previousComboBox",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[69]}}": "nextEditText",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[69]}}": "previousEditText",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[70]}}": "nextFormField",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[70]}}": "previousFormField",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[71]}}": "nextGraphic",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[71]}}": "previousGraphic",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[72]}}": "nextHeading",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[72]}}": "previousHeading",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[73]}}": "nextListItem",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[73]}}": "previousListItem",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[76]}}": "nextLink",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[76]}}": "previousLink",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[79]}}": "nextList",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[79]}}": "previousList",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[82]}}": "nextRadio",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[82]}}": "previousRadio",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[84]}}": "nextTable",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[84]}}": "previousTable",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[66]}}": "nextButton",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[66]}}": "previousButton",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[88]}}": "nextCheckbox",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[88]}}": "previousCheckbox",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[false],\"metaKey\":[false],\"keyCode\":[186]}}": "nextLandmark",
      "{\"cvoxModifier\":false,\"stickyMode\":false,\"prefixKey\":false,\"keys\":{\"ctrlKey\":[true],\"searchKeyHeld\":[false],\"altKey\":[true],\"altGraphKey\":[false],\"shiftKey\":[true],\"metaKey\":[false],\"keyCode\":[186]}}": "previousLandmark"
  });
};
