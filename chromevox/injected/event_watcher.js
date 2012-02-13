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
 * @fileoverview Watches for events in the browser such as focus changes.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxEventWatcher');

goog.require('cvox.ApiImplementation');
goog.require('cvox.AriaUtil');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEditableTextBase');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.ChromeVoxUserCommands');
goog.require('cvox.DomUtil');
goog.require('cvox.LiveRegions');

/**
 * @constructor
 */
cvox.ChromeVoxEventWatcher = function() {
};

/**
 * The delay before the timer function is first called to check on a
 * focused text control, to see if it's been modified without an event
 * being generated.
 * @const
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.TEXT_TIMER_INITIAL_DELAY_MS = 10;

/**
 * The delay between subsequent calls to the timer function to check
 * focused text controls.
 * @const
 * @type {number}
 */
cvox.ChromeVoxEventWatcher.TEXT_TIMER_DELAY_MS = 250;

/**
 * The maximum amount of time to wait before processing events.
 * A max time is needed so that even if a page is constantly updating,
 * events will still go through.
 * @const
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventWatcher.MAX_WAIT_TIME_MS_ = 50;

/**
 * As long as the MAX_WAIT_TIME_ has not been exceeded, the event processor
 * will wait this long after the last event was received before starting to
 * process events.
 * @const
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventWatcher.WAIT_TIME_MS_ = 10;

/**
 * Amount of time in ms to wait before considering a subtree modified event to
 * be the start of a new burst of subtree modified events.
 * @const
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventWatcher.SUBTREE_MODIFIED_BURST_DURATION_ = 1000;


/**
 * Number of subtree modified events that are part of the same burst to process
 * before we give up on processing any more events from that burst.
 * @const
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventWatcher.SUBTREE_MODIFIED_BURST_COUNT_LIMIT_ = 3;


/**
 * Maximum number of live regions that we will attempt to process.
 * @const
 * @type {number}
 * @private
 */
cvox.ChromeVoxEventWatcher.MAX_LIVE_REGIONS_ = 5;

/**
 * Inits the event watcher and adds listeners.
 * @param {!Document} doc The DOM document to add event listeners to.
 */
cvox.ChromeVoxEventWatcher.init = function(doc) {
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
   * Whether or not mouse hover events should trigger focusing.
   * @type {boolean}
   */
  cvox.ChromeVoxEventWatcher.focusFollowsMouse = false;

  /**
   * The delay before a mouseover triggers focusing or announcing anything.
   * @type {number}
   */
  cvox.ChromeVoxEventWatcher.mouseoverDelayMs = 500;

  /**
   * Array of events that need to be processed.
   * @type {Array.<Event>}
   * @private
   */
  cvox.ChromeVoxEventWatcher.events_ = new Array();

  /**
   * The time when the last event was received.
   * @type {number}
   */
  cvox.ChromeVoxEventWatcher.lastEventTime = 0;

  /**
   * The timestamp for the first unprocessed event.
   * @type {number}
   */
  cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime = -1;

  /**
   * Whether or not queue processing is scheduled to run.
   * @type {boolean}
   * @private
   */
  cvox.ChromeVoxEventWatcher.queueProcessingScheduled_ = false;

  /**
   * A list of callbacks to be called when the EventWatcher has
   * completed processing all events in its queue.
   * @type {Array.<function()>}
   * @private
   */
  cvox.ChromeVoxEventWatcher.readyCallbacks_ = new Array();

  /**
   * Whether or not the ChromeOS Search key (keyCode == 91) is being held.
   *
   * We must track this manually because on ChromeOS, the Search key being held
   * down does not cause keyEvent.metaKey to be set.
   *
   * TODO (clchen, dmazzoni): Refactor this since there are edge cases
   * where manually tracking key down and key up can fail (such as when
   * the user switches tabs before letting go of the key being held).
   *
   * @type {boolean}
   * @private
   */
  cvox.ChromeVoxEventWatcher.searchKeyHeld_ = false;

  cvox.ChromeVoxEventWatcher.addEventListeners_(doc);

  /**
   * The time when the last burst of subtree modified events started
   * @type {number}
   * @private
   */
  cvox.ChromeVoxEventWatcher.lastSubtreeModifiedEventBurstTime_ = 0;

  /**
   * The number of subtree modified events in the current burst.
   * @type {number}
   * @private
   */
  cvox.ChromeVoxEventWatcher.subtreeModifiedEventsCount_ = 0;
};

/**
 * Adds an event to the events queue and updates the time when the last
 * event was received.
 *
 * @param {Event} evt The event to be added to the events queue.
 */
cvox.ChromeVoxEventWatcher.addEvent = function(evt) {
  cvox.ChromeVoxEventWatcher.events_.push(evt);
  cvox.ChromeVoxEventWatcher.lastEventTime = new Date().getTime();
  if (cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime == -1) {
    cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime = new Date().getTime();
  }
  if (!cvox.ChromeVoxEventWatcher.queueProcessingScheduled_) {
    cvox.ChromeVoxEventWatcher.queueProcessingScheduled_ = true;
    window.setTimeout(cvox.ChromeVoxEventWatcher.processQueue_,
        cvox.ChromeVoxEventWatcher.WAIT_TIME_MS_);
  }
};

/**
 * Adds a callback to be called when the event watcher has finished
 * processing all pending events.
 * @param {Function} cb The callback.
 */
cvox.ChromeVoxEventWatcher.addReadyCallback = function(cb) {
  cvox.ChromeVoxEventWatcher.readyCallbacks_.push(cb);
  cvox.ChromeVoxEventWatcher.maybeCallReadyCallbacks_();
};

/**
 * Returns whether or not there are pending events.
 * @return {boolean} Whether or not there are pending events.
 * @private
 */
cvox.ChromeVoxEventWatcher.hasPendingEvents_ = function() {
  return cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime != -1 ||
      cvox.ChromeVoxEventWatcher.queueProcessingScheduled_;
};

/**
 * Checks if the event watcher has pending events.  If not, call the oldest
 * readyCallback in a loop until exhausted or until there are pending events.
 * @private
 */
cvox.ChromeVoxEventWatcher.maybeCallReadyCallbacks_ = function() {
  while (!cvox.ChromeVoxEventWatcher.hasPendingEvents_() &&
         !cvox.ChromeVoxEventWatcher.queueProcessingScheduled_ &&
         cvox.ChromeVoxEventWatcher.readyCallbacks_.length > 0) {
    cvox.ChromeVoxEventWatcher.readyCallbacks_.shift()();
  }
};


/**
 * Add all of our event listeners to the document.
 * @param {!Document} doc The DOM document to add event listeners to.
 * @private
 */
cvox.ChromeVoxEventWatcher.addEventListeners_ = function(doc) {
  // We always need key listeners.
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'keypress', cvox.ChromeVoxEventWatcher.keyPressEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'keydown', cvox.ChromeVoxEventWatcher.keyDownEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'keyup', cvox.ChromeVoxEventWatcher.keyUpEventWatcher, true);

  // If ChromeVox isn't active, skip all other event listeners.
  if (!cvox.ChromeVox.isActive) {
    return;
  }

  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'focus', cvox.ChromeVoxEventWatcher.focusEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'blur', cvox.ChromeVoxEventWatcher.blurEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'change', cvox.ChromeVoxEventWatcher.changeEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'select', cvox.ChromeVoxEventWatcher.selectEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc, 'DOMSubtreeModified',
      cvox.ChromeVoxEventWatcher.subtreeModifiedEventWatcher, true);
  cvox.ChromeVoxEventWatcher.events_ = new Array();
  cvox.ChromeVoxEventWatcher.queueProcessingScheduled_ = false;

  // Handle mouse events directly without going into the events queue.
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'mouseover', cvox.ChromeVoxEventWatcher.mouseOverEventWatcher, true);
  cvox.ChromeVoxEventWatcher.addEventListener_(doc,
      'mouseout', cvox.ChromeVoxEventWatcher.mouseOutEventWatcher, true);
};

/**
 * Remove all registered event watchers.
 * @param {!Document} doc The DOM document to add event listeners to.
 */
cvox.ChromeVoxEventWatcher.cleanup = function(doc) {
  for (var i = 0; i < cvox.ChromeVoxEventWatcher.listeners_.length; i++) {
    var listener = cvox.ChromeVoxEventWatcher.listeners_[i];
    doc.removeEventListener(
        listener.type, listener.listener, listener.useCapture);
  }
  cvox.ChromeVoxEventWatcher.listeners_ = [];
};

/**
 * Add one event listener and save the data so it can be removed later.
 * @param {!Document} doc The DOM document to add event listeners to.
 * @param {string} type The event type.
 * @param {EventListener|function(Event):(boolean|undefined)} listener
 *     The function to be called when the event is fired.
 * @param {boolean} useCapture Whether this listener should capture events
 *     before they're sent to targets beneath it in the DOM tree.
 * @private
 */
cvox.ChromeVoxEventWatcher.addEventListener_ = function(doc, type,
    listener, useCapture) {
  cvox.ChromeVoxEventWatcher.listeners_.push(
      {'type': type, 'listener': listener, 'useCapture': useCapture});
  doc.addEventListener(type, listener, useCapture);
};

/**
 * Return the last focused node.
 * @return {Object} The last node that was focused.
 */
cvox.ChromeVoxEventWatcher.getLastFocusedNode = function() {
  return cvox.ChromeVoxEventWatcher.lastFocusedNode;
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
  if (!cvox.ChromeVoxEventWatcher.focusFollowsMouse) {
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

        var target = /** @type {Node} */(evt.target);
        cvox.DomUtil.setFocus(evt.target);
        cvox.ApiImplementation.syncToNode(target, true,
            cvox.AbstractTts.QUEUE_MODE_FLUSH);
        cvox.ChromeVoxEventWatcher.announcedMouseOverNode = target;
      }, cvox.ChromeVoxEventWatcher.mouseoverDelayMs);

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
 * Watches for focus events.
 *
 * @param {Event} evt The focus event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.focusEventWatcher = function(evt) {
  if (!cvox.ChromeVoxUserCommands.isInUserCommand()) {
    cvox.ChromeVoxEventWatcher.addEvent(evt);
  }
  return true;
};

/**
 * Handles for focus events passed to it from the events queue.
 *
 * @param {Event} evt The focus event to handle.
 */
cvox.ChromeVoxEventWatcher.focusHandler = function(evt) {
  if (evt.target &&
      evt.target.hasAttribute &&
      evt.target.getAttribute('aria-hidden') == 'true' &&
      evt.target.getAttribute('chromevoxignoreariahidden') != 'true') {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
    cvox.ChromeVoxEventWatcher.handleTextChanged(false);
    return;
  }
  if (evt.target) {
    var target = /** @type {Element} */(evt.target);
    var parentControl = cvox.DomUtil.getSurroundingControl(target);
    if (parentControl &&
        parentControl == cvox.ChromeVoxEventWatcher.lastFocusedNode) {
      cvox.ChromeVoxEventWatcher.handleControlChanged(target);
      return;
    }

    if (parentControl) {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = parentControl;
    } else {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = target;
    }

    var queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;

    if (cvox.ChromeVoxEventWatcher.handleDialogFocus(target)) {
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }

    // Navigate to this control so that it will be the same for focus as for
    // regular navigation.
    cvox.ApiImplementation.syncToNode(target, true, queueMode);

    cvox.ChromeVoxEventWatcher.handleTextChanged(false);
  } else {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
    cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = null;
  }
  return;
};

/**
 * Watches for blur events.
 *
 * @param {Event} evt The blur event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.blurEventWatcher = function(evt) {
  window.setTimeout(function() {
    if (!document.activeElement) {
      cvox.ChromeVoxEventWatcher.lastFocusedNode = null;
      cvox.ChromeVoxEventWatcher.addEvent(evt);
    }
  }, 0);
  return true;
};

/**
 * Watches for key down events.
 *
 * @param {Event} evt The keydown event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyDownEventWatcher = function(evt) {
  cvox.ChromeVoxUserCommands.keepReading = false;
  if (cvox.ChromeVoxEventWatcher.currentTextHandler) {
    cvox.ChromeVoxEventWatcher.previousTextHandlerState =
        cvox.ChromeVoxEventWatcher.currentTextHandler.saveState();
  }
  cvox.ChromeVoxEventWatcher.lastKeypressTime = new Date().getTime();

  if (cvox.ChromeVox.isChromeOS && evt.keyCode == 91) {
    cvox.ChromeVoxEventWatcher.searchKeyHeld_ = true;
  }

  // Store some extra ChromeVox-specific properties in the event.
  // Use associative array syntax (foo['bar'] rather than foo.bar)
  // so that the jscompiler doesn't try to rename these.
  evt['searchKeyHeld'] = cvox.ChromeVoxEventWatcher.searchKeyHeld_;
  evt['stickyMode'] = cvox.ChromeVox.isStickyOn;
  evt['keyPrefixOn'] = cvox.ChromeVox.keyPrefixOn;

  cvox.ChromeVox.keyPrefixOn = false;

  cvox.ChromeVoxEventWatcher.eventToEat = null;
  if (!cvox.ChromeVox.navigationManager.isChoiceWidgetActive() &&
      (!cvox.ChromeVoxKbHandler.basicKeyDownActionsListener(evt) ||
      cvox.ChromeVoxEventWatcher.handleControlAction(evt))) {
    // Swallow the event immediately to prevent the arrow keys
    // from driving controls on the web page.
    evt.preventDefault();
    evt.stopPropagation();
    // Also mark this as something to be swallowed when the followup
    // keypress/keyup counterparts to this event show up later.
    cvox.ChromeVoxEventWatcher.eventToEat = evt;
    return false;
  }
  cvox.ChromeVoxEventWatcher.addEvent(evt);
  return true;
};

/**
 * Watches for key up events.
 *
 * @param {Event} evt The event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyUpEventWatcher = function(evt) {
  if (evt.keyCode == 91) {
    cvox.ChromeVoxEventWatcher.searchKeyHeld_ = false;
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
 * Watches for key press events.
 *
 * @param {Event} evt The event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.keyPressEventWatcher = function(evt) {
  cvox.ChromeVoxEventWatcher.addEvent(evt);
  if (cvox.ChromeVoxEventWatcher.eventToEat &&
      evt.keyCode == cvox.ChromeVoxEventWatcher.eventToEat.keyCode) {
    evt.preventDefault();
    evt.stopPropagation();
    return false;
  }
  return true;
};

/**
 * Watches for change events.
 *
 * @param {Event} evt The event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.changeEventWatcher = function(evt) {
  cvox.ChromeVoxEventWatcher.addEvent(evt);
  return true;
};

/**
 * Handles change events passed to it from the events queue.
 *
 * @param {Event} evt The event to handle.
 */
cvox.ChromeVoxEventWatcher.changeHandler = function(evt) {
  if (cvox.ChromeVoxEventWatcher.handleTextChanged(false)) {
    return;
  }
  if (document.activeElement == evt.target) {
    cvox.ChromeVoxEventWatcher.handleControlChanged(document.activeElement);
  }
};

/**
 * Watches for select events.
 *
 * @param {Event} evt The event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.selectEventWatcher = function(evt) {
  cvox.ChromeVoxEventWatcher.addEvent(evt);
  return true;
};

/**
 * Watches for DOM subtree modified events.
 *
 * @param {Event} evt The event to add to the queue.
 * @return {boolean} True if the default action should be performed.
 */
cvox.ChromeVoxEventWatcher.subtreeModifiedEventWatcher = function(evt) {
  if (!evt || !evt.target) {
    return true;
  }
  cvox.ChromeVoxEventWatcher.addEvent(evt);
  return true;
};

/**
 * Handles DOM subtree modified events passed to it from the events queue.
 * If the change involves an ARIA live region, then speak it.
 *
 * @param {Event} evt The event to handle.
 */
cvox.ChromeVoxEventWatcher.subtreeModifiedHandler = function(evt) {
  // Subtree modified events can happen in bursts. If several events happen at
  // the same time, trying to process all of them will slow ChromeVox to
  // a crawl and make the page itself unresponsive (ie, Google+).
  // Before processing subtree modified events, make sure that it is not part of
  // a large burst of events.
  // TODO (clchen): Revisit this after the DOM mutation events are
  // available in Chrome.
  var currentTime = new Date().getTime();

  if ((cvox.ChromeVoxEventWatcher.lastSubtreeModifiedEventBurstTime_ +
      cvox.ChromeVoxEventWatcher.SUBTREE_MODIFIED_BURST_DURATION_) >
      currentTime) {
    cvox.ChromeVoxEventWatcher.subtreeModifiedEventsCount_++;
    if (cvox.ChromeVoxEventWatcher.subtreeModifiedEventsCount_ >
        cvox.ChromeVoxEventWatcher.SUBTREE_MODIFIED_BURST_COUNT_LIMIT_) {
      return;
    }
  } else {
    cvox.ChromeVoxEventWatcher.lastSubtreeModifiedEventBurstTime_ = currentTime;
    cvox.ChromeVoxEventWatcher.subtreeModifiedEventsCount_ = 1;
  }

  if (!evt || !evt.target) {
    return;
  }
  var target = /** @type {Element} */ evt.target;
  var regions = cvox.AriaUtil.getLiveRegions(target);
  for (var i = 0; (i < regions.length) &&
      (i < cvox.ChromeVoxEventWatcher.MAX_LIVE_REGIONS_); i++) {
    cvox.LiveRegions.updateLiveRegion(
        regions[i], cvox.AbstractTts.QUEUE_MODE_FLUSH, false);
  }
};

/**
 * Speaks updates to editable text controls as needed.
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
    } else if (currentFocus.isContentEditable ||
               currentFocus.getAttribute('role') == 'textbox') {
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
    handler.update(isKeypress);
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
  if (!cvox.ChromeVoxEventWatcher.hasPendingEvents_() &&
      cvox.ChromeVoxEventWatcher.currentTextHandler &&
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
  var announceChange = false;

  if ((control.type == 'checkbox') || (control.type == 'radio')) {
    // Always announce changes to checkboxes and radio buttons.
    announceChange = true;
    // Play earcons for checkboxes and radio buttons
    if (control.checked) {
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.CHECK_ON);
    } else {
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.CHECK_OFF);
    }
  } else if (control != cvox.ChromeVoxEventWatcher.lastFocusedNode &&
      (parentControl == null ||
       parentControl != cvox.ChromeVoxEventWatcher.lastFocusedNode)) {
    cvox.ChromeVoxEventWatcher.lastFocusedNode = control;
    cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = newValue;
    return;
  } else if (newValue == cvox.ChromeVoxEventWatcher.lastFocusedNodeValue) {
    return;
  }

  cvox.ChromeVoxEventWatcher.lastFocusedNodeValue = newValue;

  if (control.tagName == 'SELECT') {
    announceChange = true;
  }

  if (control.tagName == 'INPUT') {
    switch (control.type) {
      case 'color':
      case 'datetime':
      case 'datetime-local':
      case 'date':
      case 'month':
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
 * @return {boolean} True if an announcement was spoken.
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
    return false;
  }

  if (cvox.ChromeVox.navigationManager.currentDialog && !dialog) {
    if (!cvox.DomUtil.isDescendantOfNode(
        document.activeElement,
        cvox.ChromeVox.navigationManager.currentDialog)) {
      cvox.ChromeVox.navigationManager.currentDialog = null;

      cvox.ChromeVox.tts.speak(
          cvox.ChromeVox.msgs.getMsg('exiting_dialog'),
          cvox.AbstractTts.QUEUE_MODE_FLUSH,
          cvox.AbstractTts.PERSONALITY_ANNOTATION);
      return true;
    }
  } else {
    cvox.ChromeVox.navigationManager.currentDialog = dialog;
    var dialogText = cvox.DomUtil.collapseWhitespace(
                cvox.DomUtil.getValue(dialog) + ' ' +
                cvox.DomUtil.getName(dialog, false));
    cvox.ChromeVox.tts.speak(
        cvox.ChromeVox.msgs.getMsg('entering_dialog', [dialogText]),
        cvox.AbstractTts.QUEUE_MODE_FLUSH,
        cvox.AbstractTts.PERSONALITY_ANNOTATION);

    if (dialog.getAttribute('role') == 'alertdialog') {
      // If it's an alert dialog, also queue up the text of the dialog.
      for (var i = 0; i < dialog.childNodes.length; i++) {
        var child = dialog.childNodes[i];
        var childStyle = window.getComputedStyle(child, null);
        if (!cvox.DomUtil.isInvisibleStyle(childStyle) &&
            !cvox.AriaUtil.isHidden(child)) {
          var text = cvox.DomUtil.collapseWhitespace(
              cvox.DomUtil.getValue(child) + ' ' +
                  cvox.DomUtil.getName(child));
          if (text.length > 0) {
            cvox.ChromeVox.tts.speak(
                text,
                cvox.AbstractTts.QUEUE_MODE_FLUSH,
                cvox.AbstractTts.PERSONALITY_ANNOTATION);
          }
        }
      }
    }

    return true;
  }

  return false;
};

/**
 * Returns true if we should wait to process events.
 * @param {number} lastFocusTimestamp The timestamp of the last focus event.
 * @param {number} firstTimestamp The timestamp of the first event.
 * @param {number} currentTime The current timestamp.
 * @return {boolean} True if we should wait to process events.
 * @private
 */
cvox.ChromeVoxEventWatcher.shouldWaitToProcess_ = function(
    lastFocusTimestamp, firstTimestamp, currentTime) {
  var timeSinceFocusEvent = currentTime - lastFocusTimestamp;
  var timeSinceFirstEvent = currentTime - firstTimestamp;
  return timeSinceFocusEvent < cvox.ChromeVoxEventWatcher.WAIT_TIME_MS_ &&
      timeSinceFirstEvent < cvox.ChromeVoxEventWatcher.MAX_WAIT_TIME_MS_;
};


/**
 * Processes the events queue.
 *
 * @private
 */
cvox.ChromeVoxEventWatcher.processQueue_ = function() {
  // Return now if there are no events in the queue.
  if (cvox.ChromeVoxEventWatcher.events_.length == 0) {
    return;
  }

  // Look for the most recent focus event and delete any preceding event
  // that applied to whatever was focused previously.
  var events = cvox.ChromeVoxEventWatcher.events_;
  var lastFocusIndex = -1;
  var lastFocusTimestamp = 0;
  var evt;
  var i;
  for (i = 0; evt = events[i]; i++) {
    if (evt.type == 'focus') {
      lastFocusIndex = i;
      lastFocusTimestamp = evt.timeStamp;
    }
  }
  cvox.ChromeVoxEventWatcher.events_ = [];
  for (i = 0; evt = events[i]; i++) {
    if (i >= lastFocusIndex || evt.type == 'DOMSubtreeModified') {
      cvox.ChromeVoxEventWatcher.events_.push(evt);
    }
  }

  // If the most recent focus event was very recent, wait for things to
  // settle down before processing events, unless the max wait time has
  // passed.
  var currentTime = new Date().getTime();
  if (lastFocusIndex >= 0 &&
      cvox.ChromeVoxEventWatcher.shouldWaitToProcess_(
          lastFocusTimestamp,
          cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime,
          currentTime)) {
    window.setTimeout(cvox.ChromeVoxEventWatcher.processQueue_,
                      cvox.ChromeVoxEventWatcher.WAIT_TIME_MS_);
    return;
  }

  // Process the remaining events in the queue, in order.
  for (i = 0; evt = cvox.ChromeVoxEventWatcher.events_[i]; i++) {
    cvox.ChromeVoxEventWatcher.handleEvent_(evt);
  }
  cvox.ChromeVoxEventWatcher.events_ = new Array();
  cvox.ChromeVoxEventWatcher.firstUnprocessedEventTime = -1;
  cvox.ChromeVoxEventWatcher.queueProcessingScheduled_ = false;
  cvox.ChromeVoxEventWatcher.maybeCallReadyCallbacks_();
};

/**
 * Handle events from the queue by routing them to their respective handlers.
 *
 * @private
 * @param {Event} evt The event to be handled.
 */
cvox.ChromeVoxEventWatcher.handleEvent_ = function(evt) {
  switch (evt.type) {
    case 'keydown':
      if (cvox.ChromeVoxEventWatcher.currentTextControl) {
        cvox.ChromeVoxEventWatcher.handleTextChanged(true);
      } else {
        cvox.ChromeVoxEventWatcher.handleControlChanged(
            document.activeElement);
      }
      break;
    case 'keyup':
      break;
    case 'keypress':
      cvox.ChromeVoxEventWatcher.handleTextChanged(false);
      break;
    case 'focus':
      cvox.ChromeVoxEventWatcher.focusHandler(evt);
      break;
    case 'blur':
      if (!document.activeElement) {
        cvox.ChromeVoxEventWatcher.handleTextChanged(false);
      }
      break;
    case 'change':
      cvox.ChromeVoxEventWatcher.changeHandler(evt);
      break;
    case 'select':
      cvox.ChromeVoxEventWatcher.handleTextChanged(false);
      break;
    case 'DOMSubtreeModified':
      cvox.ChromeVoxEventWatcher.subtreeModifiedHandler(evt);
      break;
  }
};


