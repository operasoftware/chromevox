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
 * @fileoverview A widget hosting an HTML <select> element.
 * In most cases, the browser's native key-driven usage model works for user
 * interaction and manipulation of a <select>. However, on platforms like Mac
 * OS X where <select> elements get their own renderer, users can still interact
 * with <select> elements via a ChromeVox overlay/context widget.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.SelectWidget');


goog.require('cvox.OverlayWidget');


/**
 * @param {Node} node The select node.
 * @constructor
 * @extends {cvox.OverlayWidget}
 */
cvox.SelectWidget = function(node) {
  goog.base(this, '');
  this.selectNode_ = node;
};
goog.inherits(cvox.SelectWidget, cvox.OverlayWidget);


/**
 * @override
 */
cvox.SelectWidget.prototype.show = function() {
  goog.base(this, 'show');
  var container = document.createElement('div');
  container.setAttribute('role', 'menu');
  for (var i = 0, item = null; item = this.selectNode_.options[i]; i++) {
    var newItem = document.createElement('p');
    newItem.innerHTML = item.innerHTML;
    newItem.id = i;
    newItem.setAttribute('role', 'menuitem');
    container.appendChild(newItem);
  }
  this.host_.appendChild(container);
  var currentSelection = this.selectNode_.selectedIndex;
  if (typeof(currentSelection) == 'number') {
    cvox.ChromeVox.syncToNode(container.children[currentSelection], true);
  }
};


/**
 * @override
 */
cvox.SelectWidget.prototype.hide = function(opt_noSync) {
  var evt = document.createEvent('Event');
  evt.initEvent('change', false, false);
  this.selectNode_.dispatchEvent(evt);
  goog.base(this, 'hide', true);
};


/**
 * @override
 */
cvox.SelectWidget.prototype.onNavigate = function() {
  var self = this;
  cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
    var selectedIndex =
        cvox.ChromeVox.navigationManager.getCurrentNode().parentNode.id;
    self.selectNode_.selectedIndex = selectedIndex;
  })();
};


/**
 * @override
 */
cvox.SelectWidget.prototype.getNameMsg = function() {
  return ['aria_role_menu'];
};
