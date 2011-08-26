// Copyright 2010 Google Inc.
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
 * @fileoverview Watches for events in the browser such as focus changes.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

cvoxgoog.provide('cvox.ChromeVoxEventWatcher');

cvoxgoog.require('cvox.Api');
cvoxgoog.require('cvox.AriaUtil');
cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.ChromeVoxEditableTextBase');
cvoxgoog.require('cvox.ChromeVoxKbHandler');
cvoxgoog.require('cvox.ChromeVoxUserCommands');
cvoxgoog.require('cvox.DomUtil');
cvoxgoog.require('cvox.LiveRegions');

/**
 * @constructor
 */
cvox.ChromeVoxEventWatcher = function() {
};

/**
 * @type {Object}
 */
cvox.ChromeVoxEventWatcher.lastFocusedNode = null;

/**
 * @type {Object}
 */
cvox.ChromeVoxEventWatcher.announcedMouseOverNode = null;

/**
 * @type {Object}
 */
cvox.ChromeVoxEventWatcher.pendingMouseOverNode = null;

/**
 * @type {number?}
 */
cvox.ChromeVoxEventWatcher.mouseOverTimeoutId = null;

/**
 * @type {string?}
 */
cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = null;

/**
 * @type {Object}
 */
cvox.ChromeVoxEventWatcher.eventToEat = null;

/**
 * @type {Element}
 */
cvox.ChromeVoxEventWatcher.currentTextControl = null;

/**
 * @type {cvox.ChromeVoxEditableTextBase}
 */
cvox.ChromeVoxEventWatcher.currentTextHandler = null;

/**
 * @type {Object}
 */
cvox.ChromeVoxEventWatcher.previousTextHandlerState = null;

/**
 * The last timestamp for the last keypress; that helps us separate
 * user-triggered events from other events.
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.lastKeypressTime = 0;

/**
 * Array of event listeners we've added so we can unregister them if needed.
 * @type {Array}
 * @private
 */
cvox.ChromeVoxEventWatcher.listeners_ = [];

/**
 * The delay before the timer function is first called to check on a
 * focused text control, to see if it's been modified without an event
 * being generated.
 * @const
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.TEXT_TIMER_INITIAL_DELAY_MS = 10;

/**
 * Whether or not mouse hover events should trigger focusing.
 * @type {boolean}
 */
cvox.ChromeVoxEventWatcher.focusFollowsMouse = false;

/**
 * The delay before a mouseover triggers focusing or announcing anything.
 * @const
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.MOUSEOVER_DELAY_MS = 500;

/**
 * The delay between subsequent calls to the timer function to check
 * focused text controls.
 * @const
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.TEXT_TIMER_DELAY_MS = 250;

/**
 * Add all of our event listeners to the document.
 */
cvox.ChromeVoxEventWatcher.addEventListeners = function() {
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'keypress', cvox.ChromeVoxEventWatcher.keyPressEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'keydown', cvox.ChromeVoxEventWatcher.keyDownEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'keyup', cvox.ChromeVoxEventWatcher.keyUpEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'focus', cvox.ChromeVoxEventWatcher.focusEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'blur', cvox.ChromeVoxEventWatcher.blurEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'change', cvox.ChromeVoxEventWatcher.changeEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'select', cvox.ChromeVoxEventWatcher.selectEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_('DOMSubtreeModified',
      cvox.ChromeVoxEventWatcher.subtreeModifiedEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'mouseover', cvox.ChromeVoxEventWatcher.mouseOverEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(
      'mouseout', cvox.ChromeVoxEventWatcher.mouseOutEventWatcher, true);
};

/**
 * Remove all registered event watchers.
 */
cvox.ChromeVoxEventWatcher.removeEventListeners = function() {
  for (var i = 0; i < cvox.ChromeVoxEventWatcher.listeners_.length; i++) {
    var listener = cvox.ChromeVoxEventWatcher.listeners_[i];
    document.removeEventListener(
        listener.type, listener.listener, listener.useCapture);
  }
  cvox.ChromeVoxEventWatcher.listeners_ = [];
};

/**
 * Add one event listener and save the data so it can be removed later.
 * @param {string} type The event type.
 * @param {EventListener|function(Event):(boolean|undefined)} listener
 *     The function to be called when the event is fired.
 * @param {boolean} useCapture Whether this listener should capture events
 *     before they're sent to targets beneath it in the DOM tree.
 * @private
 */
cvox.ChromeVoxEventWatcher.addEventListener_ = function(
    type, listener, useCapture) {
  cvox.ChromeVoxEventWatcher.listeners_.push(
      {'type': type, 'listener': listener, 'useCapture': useCapture});
  document.addEventListener(type, listener, useCapture);
};

/**
 * Return the last focused node.
 * @return {Object} The last node that was focused.
 */
cvox.ChromeVoxEventWatcher.getLastFocusedNode = function() {
  return cvox.ChromeVoxEventWatcher.lastFocusedNode;
};

/**
 * Handles focus events.
 *
 * @param {Event} evt The focus event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.focusEventWatcher = function(evt) {
  if (evt.target &&
      evt.target.hasAttribute &&
      evt.target.getAttribute('aria-hidden') == 'true' &&
      evt.target.getAttribute('chromevoxignoreariahidden') != 'true') {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
    cvox.ChromeVoxEventWatcher.handleTextChanged(false);
    return true;
  }
  if (evt.target) {
    var target = /** @type {Element} */(evt.target);
    var parentControl = cvox.DomUtil.getSurroundingControl(target);
    if (parentControl &&
        parentControl == cvox.ChromeVoxEventWatcher.lastFocusedNode) {
      cvox.ChromeVoxEventWatcher.handleControlChanged(target);
      return true;
    }

    if (parentControl) {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = parentControl;
    } else {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = target;
    }

    if (cvox.ChromeVoxUserCommands.isInUserCommand()) {
      return true;
    }

    // Navigate to this control so that it will be the same for focus as for
    // regular navigation.
    cvox.Api.syncToNode(target, true);

    // Clear the selection so that shift tabbing will work.
    var sel = window.getSelection();
    sel.removeAllRanges();

    var dialogInfo = cvox.ChromeVoxEventWatcher.handleDialogFocus(target);
    if (dialogInfo) {
      cvox.ChromeVox.tts.speak(
          dialogInfo, 1, cvox.AbstractTts.PERSONALITY_ANNOTATION);
    }
  } else {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
    cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = null;
  }
  return true;
};

/**
 * Handles mouseover events.
 * Mouseover events are only triggered if the user touches the mouse, so
 * for users who only use the keyboard, this will have no effect.
 *
 * @param {Event} evt The mouseover event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.mouseOverEventWatcher = function(evt) {
  if (!cvox.ChromeVoxEventWatcher.focusFollowsMouse &&
    (BUILD_TYPE == BUILD_TYPE_CHROME)) {
    return true;
  }

  if (cvox.DomUtil.isDescendantOfNode(
      cvox.ChromeVoxEventWatcher.announcedMouseOverNode, evt.target)) {
    return true;
  }

  if (evt.target == cvox.ChromeVoxEventWatcher.pendingMouseOverNode) {
    return true;
  }

  cvox.ChromeVoxEventWatcher.pendingMouseOverNode = evt.target;
  if (cvox.ChromeVoxEventWatcher.mouseOverTimeoutId) {
    window.clearTimeout(cvox.ChromeVoxEventWatcher.mouseOverTimeoutId);
    cvox.ChromeVoxEventWatcher.mouseOverTimeoutId = null;
  }

  if (evt.target.tagName && (evt.target.tagName == 'BODY')) {
    cvox.ChromeVoxEventWatcher.pendingMouseOverNode = null;
    cvox.ChromeVoxEventWatcher.announcedMouseOverNode = null;
    return true;
  }

  // Only focus and announce if the mouse stays over the same target
  // for longer than the given delay.
  cvox.ChromeVoxEventWatcher.mouseOverTimeoutId = window.setTimeout(
      function() {
        cvox.ChromeVoxEventWatcher.mouseOverTimeoutId = null;
        if (evt.target != cvox.ChromeVoxEventWatcher.pendingMouseOverNode) {
          return;
        }

        cvox.DomUtil.setFocus(evt.target);
        cvox.ChromeVoxEventWatcher.focusEventWatcher(evt);
        cvox.ChromeVoxEventWatcher.announcedMouseOverNode = evt.target;
      }, cvox.ChromeVoxEventWatcher.MOUSEOVER_DELAY_MS);

  return true;
};

/**
 * Handles mouseout events.
 *
 * @param {Event} evt The mouseout event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.mouseOutEventWatcher = function(evt) {
  if (evt.target == cvox.ChromeVoxEventWatcher.pendingMouseOverNode) {
    cvox.ChromeVoxEventWatcher.pendingMouseOverNode = null;
    if (cvox.ChromeVoxEventWatcher.mouseOverTimeoutId) {
      window.clearTimeout(cvox.ChromeVoxEventWatcher.mouseOverTimeoutId);
      cvox.ChromeVoxEventWatcher.mouseOverTimeoutId = null;
    }
  }

  return true;
};

/**
 * Handles blur events.
 *
 * @param {Object} evt The blur event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.blurEventWatcher = function(evt) {
  window.setTimeout(function() {
    if (!document.activeElement) {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
      cvox.ChromeVoxEventWatcher.handleTextChanged(false);
    }
  }, 0);

  return true;
};

/**
 * Handles key down events.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyDownEventWatcher = function(evt) {
  if (cvox.ChromeVoxEventWatcher.currentTextHandler) {
    cvox.ChromeVoxEventWatcher.previousTextHandlerState =
        cvox.ChromeVoxEventWatcher.currentTextHandler.saveState();
  }
  cvox.ChromeVoxEventWatcher.lastKeypressTime = new Date().getTime();

  if (evt.keyCode == cvox.ChromeVox.stickyKeyCode) {
    cvox.ChromeVoxEventWatcher.cvoxKey = true;
  }
  evt.cvoxKey = cvox.ChromeVoxEventWatcher.cvoxKey;
  evt.stickyMode = cvox.ChromeVox.isStickyOn;

  setTimeout(function() {
    if (document.activeElement == evt.target) {
      cvox.ChromeVoxEventWatcher.handleControlChanged(evt.target);
    }
  }, 0);

  cvox.ChromeVoxEventWatcher.eventToEat = null;
  if (!cvox.ChromeVoxKbHandler.basicKeyDownActionsListener(evt) ||
          cvox.ChromeVoxEventWatcher.handleControlAction(evt)) {
    // Swallow the event immediately to prevent the arrow keys
    // from driving controls on the web page.
    evt.preventDefault();
    evt.stopPropagation();
    // Also mark this as something to be swallowed when the followup
    // keypress/keyup counterparts to this event show up later.
    cvox.ChromeVoxEventWatcher.eventToEat = evt;
    return false;
  }
  cvox.ChromeVoxEventWatcher.handleTextChanged(true);
  return true;
};

/**
 * Handles key press events.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyPressEventWatcher = function(evt) {
  cvox.ChromeVoxEventWatcher.handleTextChanged(false);

  if (cvox.ChromeVoxEventWatcher.eventToEat &&
      evt.keyCode == cvox.ChromeVoxEventWatcher.eventToEat.keyCode) {
    evt.preventDefault();
    evt.stopPropagation();
    return false;
  }
  return true;
};

/**
 * Handles key up events.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyUpEventWatcher = function(evt) {
  if (evt.keyCode == cvox.ChromeVox.stickyKeyCode) {
    // Treat LWin/Search key as a modifier key only on ChromeOS
    cvox.ChromeVoxEventWatcher.cvoxKey = false;
  }
  if (cvox.ChromeVoxEventWatcher.eventToEat &&
      evt.keyCode == cvox.ChromeVoxEventWatcher.eventToEat.keyCode) {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
  }
  return true;
};

/**
 * Handles change events.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.changeEventWatcher = function(evt) {
  if (cvox.ChromeVoxEventWatcher.handleTextChanged(false)) {
    return true;
  }
  if (document.activeElement == evt.target) {
    cvox.ChromeVoxEventWatcher.handleControlChanged(evt.target);
  }
  return true;
};

/**
 * Handles select events.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.selectEventWatcher = function(evt) {
  if (cvox.ChromeVoxEventWatcher.handleTextChanged(false)) {
    return true;
  }
  return true;
};

/**
 * Handles DOM subtree modified events.
 * If the change involves an ARIA live region, then speak it.
 *
 * @param {Object} evt The event to process.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.subtreeModifiedEventWatcher = function(evt) {
  if (!evt || !evt.target) {
    return true;
  }
  var node = evt.target;
  var regions = cvox.AriaUtil.getLiveRegions(node);
  for (var i = 0; i < regions.length; i++) {
    cvox.LiveRegions.updateLiveRegion(regions[i]);
  }
  return true;
};

/**
 * Speaks updates to editable text controls as needed.
 *
 * TODO (clchen): Group text changes with focus events better so that if
 * text is changed immediately when focus happens, ChromeVox can say something
 * more intelligent to the user and filter out the repetition.
 *
 * @param {boolean} isKeypress Was this change triggered by a keypress?
 * @return {boolean} True if an editable text control has focus.
 */
cvox.ChromeVoxEventWatcher.handleTextChanged = function(isKeypress) {
  var currentFocus = document.activeElement;
  if (currentFocus &&
      currentFocus.hasAttribute &&
      currentFocus.getAttribute('aria-hidden') == 'true' &&
      currentFocus.getAttribute('chromevoxignoreariahidden') != 'true') {
    currentFocus = null;
  }

  if (currentFocus != cvox.ChromeVoxEventWatcher.currentTextControl) {
    if (cvox.ChromeVoxEventWatcher.currentTextControl) {
      cvox.ChromeVoxEventWatcher.currentTextControl.removeEventListener(
          'input', cvox.ChromeVoxEventWatcher.changeEventWatcher, false);
      cvox.ChromeVoxEventWatcher.currentTextControl.removeEventListener(
          'click', cvox.ChromeVoxEventWatcher.changeEventWatcher, false);
    }
    cvox.ChromeVoxEventWatcher.currentTextControl = null;
    cvox.ChromeVoxEventWatcher.currentTextHandler = null;
    cvox.ChromeVoxEventWatcher.previousTextHandlerState = null;

    if (currentFocus == null) {
      return false;
    }
    if (currentFocus.constructor == HTMLInputElement &&
        cvox.DomUtil.isInputTypeText(currentFocus)) {
      cvox.ChromeVoxEventWatcher.currentTextControl = currentFocus;
      cvox.ChromeVoxEventWatcher.currentTextHandler =
          new cvox.ChromeVoxEditableHTMLInput(currentFocus, cvox.ChromeVox.tts);
    } else if (currentFocus.constructor == HTMLTextAreaElement) {
      cvox.ChromeVoxEventWatcher.currentTextControl = currentFocus;
      cvox.ChromeVoxEventWatcher.currentTextHandler =
          new cvox.ChromeVoxEditableTextArea(currentFocus, cvox.ChromeVox.tts);
    } else if (currentFocus.isContentEditable) {
      cvox.ChromeVoxEventWatcher.currentTextControl = currentFocus;
      cvox.ChromeVoxEventWatcher.currentTextHandler =
          new cvox.ChromeVoxEditableContentEditable(currentFocus,
          cvox.ChromeVox.tts);
    }

    if (cvox.ChromeVoxEventWatcher.currentTextControl) {
      cvox.ChromeVoxEventWatcher.currentTextControl.addEventListener(
        'input', cvox.ChromeVoxEventWatcher.changeEventWatcher, false);
      cvox.ChromeVoxEventWatcher.currentTextControl.addEventListener(
        'click', cvox.ChromeVoxEventWatcher.changeEventWatcher, false);

      var message = '';
      message = cvox.ChromeVoxEventWatcher.currentTextHandler.getValue();
      if (cvox.ChromeVoxEventWatcher.currentTextHandler.node) {
        var controlDescription = cvox.DomUtil.getControlDescription(
            cvox.ChromeVoxEventWatcher.currentTextHandler.node);
        message = controlDescription.text + ' ' + message;
      }
      cvox.ChromeVox.tts.speak(message, 1, null);

      window.setTimeout(cvox.ChromeVoxEventWatcher.textTimer,
                        cvox.ChromeVoxEventWatcher.TEXT_TIMER_INITIAL_DELAY_MS);
      if (!cvox.ChromeVoxUserCommands.isInUserCommand()) {
        cvox.ChromeVox.navigationManager.syncToNode(
            cvox.ChromeVoxEventWatcher.currentTextControl);
      }
    }

    return (null != cvox.ChromeVoxEventWatcher.currentTextHandler);
  }
  if (cvox.ChromeVoxEventWatcher.currentTextHandler) {
    var handler = cvox.ChromeVoxEventWatcher.currentTextHandler;
    window.setTimeout(function() {
      // If this update was not triggered by an explicit user keypress,
      // and we already started speaking an update to this text control
      // very recently (less than 50 ms ago), restore the control to its
      // previous state and then speak the new update (interrupting any
      // ongoing speech).  That way, if the user presses a key and the
      // page's javascript causes a few more characters to be inserted,
      // we'll speak it as one big update.
      var now = new Date().getTime();
      if (!isKeypress &&
          handler.needsUpdate() &&
          cvox.ChromeVoxEventWatcher.previousTextHandlerState &&
          now - cvox.ChromeVoxEventWatcher.lastKeypressTime < 50) {
        handler.restoreState(
            cvox.ChromeVoxEventWatcher.previousTextHandlerState);
      }
      handler.update(isKeypress);
    }, 0);
    return true;
  }
  return false;
};

/**
 * Called repeatedly while a text box has focus, because many changes
 * to a text box don't ever generate events - e.g. if the page's javascript
 * changes the contents of the text box after some delay.
 */
cvox.ChromeVoxEventWatcher.textTimer = function() {
  if (cvox.ChromeVoxEventWatcher.currentTextHandler &&
      cvox.ChromeVoxEventWatcher.currentTextHandler.needsUpdate()) {
    cvox.ChromeVoxEventWatcher.handleTextChanged(false);
  }

  if (cvox.ChromeVoxEventWatcher.currentTextControl) {
    window.setTimeout(cvox.ChromeVoxEventWatcher.textTimer,
                      cvox.ChromeVoxEventWatcher.TEXT_TIMER_DELAY_MS);
  }
};

/**
 * Speaks updates to other form controls as needed.
 * @param {Element} control The target control.
 */
cvox.ChromeVoxEventWatcher.handleControlChanged = function(control) {
  var newValue = cvox.DomUtil.getControlValueAndStateString(control);
  var parentControl = cvox.DomUtil.getSurroundingControl(control);

  if (control != cvox.ChromeVoxEventWatcher.lastFocusedNode &&
      (parentControl == null ||
       parentControl != cvox.ChromeVoxEventWatcher.lastFocusedNode)) {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = control;
    cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = newValue;
    return;
  }

  if (newValue == cvox.ChromeVoxEventWatcher.lastFocusedNodeValue) {
    return;
  }

  cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = newValue;

  var announceChange = false;

  if (control.tagName == 'SELECT') {
    announceChange = true;
  }

  if (control.tagName == 'INPUT') {
    switch (control.type) {
      case 'checkbox':
      case 'color':
      case 'datetime':
      case 'datetime-local':
      case 'date':
      case 'month':
      case 'radio':
      case 'range':
      case 'week':
        announceChange = true;
        break;
      default:
        break;
    }
  }

  // Always announce changes for anything with an ARIA role.
  if (control.hasAttribute && control.hasAttribute('role')) {
    announceChange = true;
  }

  if (announceChange && !cvox.ChromeVoxUserCommands.isInUserCommand()) {
    cvox.ChromeVox.tts.speak(newValue, 0, null);
  }
};

/**
 * Handle actions on form controls triggered by key presses.
 * @param {Object} evt The event.
 * @return {boolean} True if this key event was handled.
 */
cvox.ChromeVoxEventWatcher.handleControlAction = function(evt) {
  var control = evt.target;

  if (control.tagName == 'SELECT' && (control.size <= 1) &&
      (evt.keyCode == 13 || evt.keyCode == 32)) { // Enter or Space
    // TODO (dmazzoni, clchen): Remove this workaround once accessibility
    // APIs make browser based popups accessible.
    //
    // Do nothing, but eat this keystroke when the SELECT control
    // has a dropdown style since if we don't, it will generate
    // a browser popup menu which is not accessible.
    // List style SELECT controls are fine and don't need this workaround.
    evt.preventDefault();
    evt.stopPropagation();
    return true;
  }

  if (control.tagName == 'INPUT' && control.type == 'range') {
    var value = parseFloat(control.value);
    var step;
    if (control.step && control.step > 0.0) {
      step = control.step;
    } else if (control.min && control.max) {
      var range = (control.max - control.min);
      if (range > 2 && range < 31) {
        step = 1;
      } else {
        step = (control.max - control.min) / 10;
      }
    } else {
      step = 1;
    }

    if (evt.keyCode == 37 || evt.keyCode == 38) {  // left or up
      value -= step;
    } else if (evt.keyCode == 39 || evt.keyCode == 40) {  // right or down
      value += step;
    }

    if (control.max && value > control.max) {
      value = control.max;
    }
    if (control.min && value < control.min) {
      value = control.min;
    }

    control.value = value;
  }
  return false;
};

/**
 * When an element receives focus, see if we've entered or left a dialog
 * and return a string describing the event.
 *
 * @param {Element} target The element that just received focus.
 * @return {?string} The description of the dialog event, or null if a
 *     dialog was not involved in this focus.
 */
cvox.ChromeVoxEventWatcher.handleDialogFocus = function(target) {
  var dialog = target;
  while (dialog) {
    if (dialog.hasAttribute) {
      var role = dialog.getAttribute('role');
      if (role == 'dialog' || role == 'alertdialog') {
        break;
      }
    }
    dialog = dialog.parentElement;
  }

  if (dialog == cvox.ChromeVox.navigationManager.currentDialog) {
    return null;
  }

  if (cvox.ChromeVox.navigationManager.currentDialog && !dialog) {
    // If exiting a dialog, delay a bit in case the page is managing focus
    // and moves focus immediately back to the dialog.  After the delay,
    // if the focus is still outside the dialog, queue a message that the
    // dialog was exited.
    window.setTimeout(function() {
      if (!cvox.DomUtil.isDescendantOfNode(
              document.activeElement,
              cvox.ChromeVox.navigationManager.currentDialog)) {
        cvox.ChromeVox.navigationManager.currentDialog = null;
        cvox.ChromeVox.tts.speak('Exiting dialog.', 1, null);
      }
    }, 100);
    return null;
  } else {
    cvox.ChromeVox.navigationManager.currentDialog = dialog;
    if (dialog.getAttribute('role') == 'alertdialog') {
      // If it's an alert dialog, also queue up the text of the dialog.
      window.setTimeout(function() {
        for (var i = 0; i < dialog.childNodes.length; i++) {
          var child = dialog.childNodes[i];
          var childStyle = window.getComputedStyle(child, null);
          if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
              !cvox.AriaUtil.isHidden(child)) {
            var text = cvox.DomUtil.collapseWhitespace(
                cvox.DomUtil.getValue(child) + ' ' +
                cvox.DomUtil.getName(child));
            if (text.length > 0) {
              cvox.ChromeVox.tts.speak(text, 1, null);
            }
          }
        }
      }, 0);
    }
    var dialogText = cvox.DomUtil.collapseWhitespace(
                cvox.DomUtil.getValue(dialog) + ' ' +
                cvox.DomUtil.getName(dialog, false));
    return 'Entering dialog ' + dialogText + '.';
  }
};

