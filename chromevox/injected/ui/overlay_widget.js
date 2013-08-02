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
 * @fileoverview A widget hosting an HTML snippet.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.OverlayWidget');

goog.require('cvox.DomUtil');
goog.require('cvox.SearchWidget');


/**
 * @param {string} snippet The HTML snippet to render.
 * @constructor
 * @extends {cvox.SearchWidget}
 */
cvox.OverlayWidget = function(snippet) {
  goog.base(this);
  this.snippet_ = snippet;
};
goog.inherits(cvox.OverlayWidget, cvox.SearchWidget);


/**
 * @override
 */
cvox.OverlayWidget.prototype.show = function() {
  goog.base(this, 'show');
  var host = document.createElement('DIV');
  host.innerHTML = this.snippet_;

  // Position the overlay over the current ChromeVox selection.
  var hitPoint = cvox.DomUtil.elementToPoint(
      cvox.ChromeVox.navigationManager.getCurrentNode());
  host.style.position = 'absolute';
  host.style.left = hitPoint.x;
  host.style.top = hitPoint.y;

  document.body.appendChild(host);
  cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(host);
  this.host_ = host;
};


/**
 * @override
 */
cvox.OverlayWidget.prototype.hide = function(opt_noSync) {
  this.host_.remove();
  goog.base(this, 'hide');
};


/**
 * @override
 */
cvox.OverlayWidget.prototype.onKeyDown = function(evt) {
  // Allow the base class to handle all keys first.
  goog.base(this, 'onKeyDown', evt);

  // Do not interfere with any key that exits the widget.
  if (evt.keyCode == 13 || evt.keyCode == 27) { // Enter or escape.
    return true;
  }

  // Bound navigation within the snippet for any other key.
  var r = cvox.ChromeVox.navigationManager.isReversed();
  if (!cvox.DomUtil.isDescendantOfNode(
      cvox.ChromeVox.navigationManager.getCurrentNode(), this.host_)) {
    if (r) {
      cvox.ChromeVox.navigationManager.syncToBeginning();
    } else {
      cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(this.host_);
    }
    this.onNavigate();
    cvox.ChromeVox.navigationManager.speakDescriptionArray(
        cvox.ChromeVox.navigationManager.getDescription(), 0, null);
  }
};
