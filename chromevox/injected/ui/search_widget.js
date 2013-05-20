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
 * @fileoverview JavaScript for poppup up a search widget and performing
 * search within a page.
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.SearchWidget');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.CursorSelection');
goog.require('cvox.NavigationManager');
goog.require('cvox.Widget');


/**
 * Initializes the search widget.
 * @constructor
 * @extends {cvox.Widget}
 */
cvox.SearchWidget = function() {
  /**
   * @type {Element}
   * @private
   */
  this.containerNode_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.txtNode_ = null;

  /**
   * @type {string}
   * @const
   * @private
   */
  this.PROMPT_ = 'Search:';

  /**
   * @type {boolean}
   * @private
   */
  this.caseSensitive_ = false;

  /**
   * @type {boolean}
   * @private
  */
  this.hasMatch_ = false;
  goog.base(this);
};
goog.inherits(cvox.SearchWidget, cvox.Widget);
goog.addSingletonGetter(cvox.SearchWidget);


/**
 * @override
 */
cvox.SearchWidget.prototype.show = function() {
  goog.base(this, 'show');
  this.active = true;
  this.hasMatch_ = false;
  cvox.ChromeVox.navigationManager.setGranularity(
      cvox.NavigationShifter.GRANULARITIES.OBJECT, true);

  // Always start search forward.
  cvox.ChromeVox.navigationManager.setReversed(false);

  // During profiling, NavigationHistory was found to have a serious performance
  // impact on search.
  this.focusRecovery_ = cvox.ChromeVox.navigationManager.getFocusRecovery();
  cvox.ChromeVox.navigationManager.setFocusRecovery(false);

  var containerNode = this.createContainerNode_();
  this.containerNode_ = containerNode;

  var overlayNode = this.createOverlayNode_();
  containerNode.appendChild(overlayNode);

  var promptNode = document.createElement('span');
  promptNode.innerHTML = this.PROMPT_;
  overlayNode.appendChild(promptNode);

  this.txtNode_ = document.createElement('span');
  overlayNode.appendChild(this.txtNode_);

  document.body.appendChild(containerNode);

  window.setTimeout(function() {
    containerNode.style['opacity'] = '1.0';
  }, 0);
};


/**
 * @override
 */
cvox.SearchWidget.prototype.hide = function(opt_noSync) {
  if (this.isActive()) {
    var containerNode = this.containerNode_;
    containerNode.style.opacity = '0.0';
    window.setTimeout(function() {
      document.body.removeChild(containerNode);
    }, 1000);
    this.txtNode_ = null;
    cvox.SearchWidget.containerNode = null;
    cvox.ChromeVox.navigationManager.setFocusRecovery(this.focusRecovery_);
    this.active = false;
  }

  cvox.$m('choice_widget_exited')
      .andPause()
      .andMessage(this.getNameMsg())
      .speakFlush();

  if (!this.hasMatch_ || !opt_noSync) {
    cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(
        this.initialNode);
  }
  cvox.ChromeVoxEventSuspender.withSuspendedEvents(goog.bind(
      cvox.ChromeVox.navigationManager.syncAll,
      cvox.ChromeVox.navigationManager))(true);
  cvox.ChromeVox.navigationManager.speakDescriptionArray(
      cvox.ChromeVox.navigationManager.getDescription(),
      cvox.AbstractTts.QUEUE_MODE_QUEUE,
      null);

  goog.base(this, 'hide', true);
};


/**
 * @override
 */
cvox.SearchWidget.prototype.getNameMsg = function() {
  return ['search_widget_intro'];
};


/**
 * @override
 */
cvox.SearchWidget.prototype.getHelpMsg = function() {
  return 'search_widget_intro_help';
};


/**
 * @override
 */
cvox.SearchWidget.prototype.onKeyDown = function(evt) {
  if (!this.isActive()) {
    return false;
  }
  var searchStr = this.txtNode_.textContent;
  if (evt.keyCode == 8) { // Backspace
    if (searchStr.length > 0) {
      searchStr = searchStr.substring(0, searchStr.length - 1);
      this.txtNode_.textContent = searchStr;
      this.beginSearch_(searchStr);
    } else {
      cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(
          this.initialNode);
      cvox.ChromeVox.navigationManager.syncAll();
    }
  } else if (evt.keyCode == 40) { // Down arrow
    this.next_(searchStr, false);
  } else if (evt.keyCode == 38) { // Up arrow
    this.next_(searchStr, true);
  } else if (evt.keyCode == 13) { // Enter
    this.hide(true);
  } else if (evt.keyCode == 27) { // Escape
    this.hide(false);
  } else if (evt.ctrlKey && evt.keyCode == 67) { // ctrl + c
    this.toggleCaseSensitivity_();
  } else {
    return goog.base(this, 'onKeyDown', evt);
  }
  evt.preventDefault();
  evt.stopPropagation();
  return true;
};


/**
 * Adds the letter the user typed to the search string and updates the search.
 *
 * @param {Object} evt The keyPress event.
 * @return {boolean} Whether or not the event was handled.
 * @override
 */
cvox.SearchWidget.prototype.onKeyPress = function(evt) {
  if (!this.isActive()) {
    return false;
  }

  this.txtNode_.textContent += String.fromCharCode(evt.charCode);
  var searchStr = this.txtNode_.textContent;
  this.beginSearch_(searchStr);
  evt.preventDefault();
  evt.stopPropagation();
  return true;
};


/**
 * Called when navigation occurs.
 * Override this method to react to navigation caused by user input.
 */
cvox.SearchWidget.prototype.onNavigate = function() {
};


/**
 * Gets the predicate to apply to every search.
 * @return {?function(Array.<Node>)} A predicate; if null, no predicate applies.
 */
cvox.SearchWidget.prototype.getPredicate = function() {
  return null;
};


/**
 * Create the container node for the search overlay.
 *
 * @return {!Element} The new element, not yet added to the document.
 * @private
 */
cvox.SearchWidget.prototype.createContainerNode_ = function() {
  var containerNode = document.createElement('div');
  containerNode.style['position'] = 'fixed';
  containerNode.style['top'] = '50%';
  containerNode.style['left'] = '50%';
  containerNode.style['-webkit-transition'] = 'all 0.3s ease-in';
  containerNode.style['opacity'] = '0.0';
  containerNode.style['z-index'] = '2147483647';
  containerNode.setAttribute('aria-hidden', 'true');
  return containerNode;
};


/**
 * Create the search overlay. This should be a child of the node
 * returned from createContainerNode.
 *
 * @return {!Element} The new element, not yet added to the document.
 * @private
 */
cvox.SearchWidget.prototype.createOverlayNode_ = function() {
  var overlayNode = document.createElement('div');
  overlayNode.style['position'] = 'relative';
  overlayNode.style['left'] = '-50%';
  overlayNode.style['top'] = '-40px';
  overlayNode.style['line-height'] = '1.2em';
  overlayNode.style['font-size'] = '20px';
  overlayNode.style['padding'] = '30px';
  overlayNode.style['min-width'] = '150px';
  overlayNode.style['color'] = '#fff';
  overlayNode.style['background-color'] = 'rgba(0, 0, 0, 0.7)';
  overlayNode.style['border-radius'] = '10px';
  return overlayNode;
};


/**
 * Toggles whether or not searches are case sensitive.
 * @private
 */
cvox.SearchWidget.prototype.toggleCaseSensitivity_ = function() {
  if (this.caseSensitive_) {
    cvox.SearchWidget.caseSensitive_ = false;
    cvox.ChromeVox.tts.speak('Ignoring case.', 0, null);
  } else {
    this.caseSensitive_ = true;
    cvox.ChromeVox.tts.speak('Case sensitive.', 0, null);
  }
};


/**
 * Gets the next result.
 *
 * @param {string} searchStr The text to search for.
 * @return {Array.<cvox.NavDescription>} The next result, in the form of
 * NavDescriptions.
 * @private
 */
cvox.SearchWidget.prototype.getNextResult_ = function(searchStr) {
  var r = cvox.ChromeVox.navigationManager.isReversed();
  if (!this.caseSensitive_) {
    searchStr = searchStr.toLowerCase();
  }

  cvox.ChromeVox.navigationManager.setGranularity(
      cvox.NavigationShifter.GRANULARITIES.OBJECT, true);

  do {
    if (this.getPredicate()) {
      var retNode = this.getPredicate()(cvox.DomUtil.getAncestors(
          cvox.ChromeVox.navigationManager.getCurrentNode()));
      if (!retNode) {
        continue;
      }
    }

    var descriptions = cvox.ChromeVox.navigationManager.getDescription();
    for (var i = 0; i < descriptions.length; i++) {
      var targetStr = this.caseSensitive_ ? descriptions[i].text :
          descriptions[i].text.toLowerCase();
      var targetIndex = targetStr.indexOf(searchStr);

      // Surround search hit with pauses.
      if (targetIndex != -1 && targetStr.length > searchStr.length) {
        descriptions[i].text =
            cvox.DomUtil.collapseWhitespace(
                targetStr.substring(0, targetIndex)) +
            ', ' + searchStr + ', ' +
            targetStr.substring(targetIndex + searchStr.length);
        descriptions[i].text =
            cvox.DomUtil.collapseWhitespace(descriptions[i].text);
      }
      if (targetIndex != -1) {
        return descriptions;
      }
    }
    cvox.ChromeVox.navigationManager.setReversed(r);
  } while (cvox.ChromeVox.navigationManager.navigate(true,
      cvox.NavigationShifter.GRANULARITIES.OBJECT));
};


/**
 * Performs the search starting from the initial position.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.beginSearch_ = function(searchStr) {
  var result = this.getNextResult_(searchStr);
  this.outputSearchResult_(result);
};


/**
 * Goes to the next (directed) matching result.
 *
 * @param {string} searchStr The text to search for.
 * @param {boolean=} opt_reversed The direction.
 * @return {Array.<cvox.NavDescription>} The next result.
 * @private
 */
cvox.SearchWidget.prototype.next_ = function(searchStr, opt_reversed) {
  cvox.ChromeVox.navigationManager.setReversed(!!opt_reversed);

  var success = false;
  if (this.getPredicate()) {
    success = cvox.ChromeVox.navigationManager.findNext(
        /** @type {function(Array.<Node>)} */ (this.getPredicate()));
    // TODO(dtseng): findNext always seems to point direction forward!
    cvox.ChromeVox.navigationManager.setReversed(!!opt_reversed);
    if (!success) {
      cvox.ChromeVox.navigationManager.syncToBeginning();
      cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
      success = true;
    }
  } else {
    success = cvox.ChromeVox.navigationManager.navigate(true);
  }
  var result = success ? this.getNextResult_(searchStr) : null;
  this.outputSearchResult_(result);
  this.onNavigate();
  return result;
};


/**
 * Given a range corresponding to a search result, highlight the result,
 * speak it, focus the node if applicable, and speak some instructions
 * at the end.
 *
 * @param {Array.<cvox.NavDescription>} result The description of the next
 * result. If null, no more results were found and an error will be presented.
 * @private
 */
cvox.SearchWidget.prototype.outputSearchResult_ = function(result) {
  cvox.ChromeVox.tts.stop();
  if (!result) {
    cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
    this.hasMatch_ = false;
    return;
  }

  this.hasMatch_ = true;

  // Speak the modified description and some instructions.
  cvox.ChromeVoxEventSuspender.withSuspendedEvents(goog.bind(
      cvox.ChromeVox.navigationManager.syncAll,
      cvox.ChromeVox.navigationManager))(true);

  cvox.ChromeVox.navigationManager.speakDescriptionArray(
      result,
      cvox.AbstractTts.QUEUE_MODE_FLUSH,
      null);

  cvox.ChromeVox.tts.speak(cvox.ChromeVox.msgs.getMsg('search_help_item'),
                           cvox.AbstractTts.QUEUE_MODE_QUEUE,
                           cvox.AbstractTts.PERSONALITY_ANNOTATION);
};
