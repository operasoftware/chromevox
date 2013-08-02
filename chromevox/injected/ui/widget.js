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
 * @fileoverview Base class for all ChromeVox widgets.
 *
 * Widgets are keyboard driven and modal mediums for ChromeVox to expose
 * additional features such as lists, interactive search, or grids.
 * @author dtseng@google.com (David Tseng)
 */

goog.provide('cvox.Widget');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.SpokenMessages');

/**
 * Keeps a reference to a currently or formerly active widget. This enforces
 * the singleton nature of widgets.
 * @type {cvox.Widget}
 * @private
 */
cvox.Widget.ref_;


/**
 * @constructor
 */
cvox.Widget = function() {
  /**
   * @type {boolean}
   * @protected
   */
  this.active = false;


  /**
   * Keeps a reference to a node which should receive focus once a widget hides.
   * @type {Node}
   * @protected
   */
  this.initialFocus = null;

  /**
   * Keeps a reference to a node which should receive selection once a widget
   * hides.
   * @type {Node}
   * @protected
   */
  this.initialNode = null;

  // Checks to see if there is a current widget in use.
  if (!cvox.Widget.ref_ || !cvox.Widget.ref_.isActive()) {
    cvox.Widget.ref_ = this;
  }
};


/**
 * Returns whether or not the widget is active.
 * @return {boolean} Whether the widget is active.
 */
cvox.Widget.prototype.isActive = function() {
  return this.active;
};


/**
 * Visual/aural display of this widget.
 */
cvox.Widget.prototype.show = function() {
  if (this.isActive()) {
    // Only one widget should be shown at any given time.
    this.hide(true);
  }
  this.onKeyDown = goog.bind(this.onKeyDown, this);
  this.onKeyPress = goog.bind(this.onKeyPress, this);
  window.addEventListener('keydown', this.onKeyDown, true);
  window.addEventListener('keypress', this.onKeyPress, true);

  this.initialNode =
      cvox.ChromeVox.navigationManager.getCurrentNode();
  this.initialFocus = document.activeElement;
  this.isStickyOn = cvox.ChromeVox.isStickyOn;

  // Widgets do not respond to sticky key.
  cvox.ChromeVox.host.sendToBackgroundPage({
      'target': 'Prefs',
      'action': 'setPref',
      'pref': 'sticky',
      'value': false,
      'announce': false});

  if (this.getNameMsg() && this.getHelpMsg()) {
    cvox.$m(this.getNameMsg())
        .andPause()
        .andMessage(this.getHelpMsg())
        .speakFlush();
  }
  cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.OBJECT_OPEN);

  this.active = true;
};


/**
 * Visual/aural hide of this widget.
 * @param {boolean} opt_noSync Whether to attempt to sync to the node before
 * this widget was first shown. If left unspecified or false, an attempt to sync
 * will be made.
 */
cvox.Widget.prototype.hide = function(opt_noSync) {
  window.removeEventListener('keypress', this.onKeyPress, true);
  window.removeEventListener('keydown', this.onKeyDown, true);

  cvox.ChromeVox.host.sendToBackgroundPage({
      'target': 'Prefs',
      'action': 'setPref',
      'pref': 'sticky',
      'value': this.isStickyOn,
      'announce': false});

  cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.OBJECT_CLOSE);
  if (!opt_noSync) {
    this.initialNode = this.initialNode.nodeType == 1 ?
        this.initialNode : this.initialNode.parentNode;
    cvox.ApiImplementation.syncToNode(this.initialNode,
                                      true,
                                      cvox.AbstractTts.QUEUE_MODE_QUEUE);
  }

  this.active = false;
};


/**
 * Toggle between showing and hiding.
 */
cvox.Widget.prototype.toggle = function() {
  if (this.isActive()) {
    this.hide();
  } else {
    this.show();
  }
};


/**
 * The name of the widget.
 * @return {!Array} The message id referencing the name of the widget in an
 * array argument form passable to cvox.ChromeVox.msgs.getMsg.apply.
 */
cvox.Widget.prototype.getNameMsg = goog.abstractMethod;


/**
 * Gets the help message for the widget.
 * The help message succintly describes how to use the widget.
 * @return {string} The message id referencing the help for the widget.
 */
cvox.Widget.prototype.getHelpMsg = goog.abstractMethod;


/**
 * The default widget key down handler.
 *
 * @param {Object} evt The keyDown event.
 * @return {boolean} Whether or not the event was handled.
 *
 * @protected
 */
cvox.Widget.prototype.onKeyDown = function(evt) {
  if (evt.keyCode == 27) { // Escape
    this.hide();
    evt.preventDefault();
    return true;
  } else if (evt.keyCode == 9) { // Tab
    this.hide();
    return true;
  } else if (evt.keyCode == 17) {
    cvox.ChromeVox.tts.stop();
  }

  evt.stopPropagation();
  return true;
};


/**
 * The default widget key press handler.
 *
 * @param {Object} evt The keyPress event.
 * @return {boolean} Whether or not the event was handled.
 *
 * @protected
 */
cvox.Widget.prototype.onKeyPress = function(evt) {
  return false;
};
/**
 * @return {boolean} True if any widget is currently active.
 */
cvox.Widget.isActive = function() {
  return (cvox.Widget.ref_ && cvox.Widget.ref_.isActive()) || false;
};
