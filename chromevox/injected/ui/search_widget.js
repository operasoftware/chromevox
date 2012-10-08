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
};
goog.inherits(cvox.SearchWidget, cvox.Widget);
goog.addSingletonGetter(cvox.SearchWidget);


/**
 * @override
 */
cvox.SearchWidget.prototype.show = function() {
  goog.base(this, 'show');
  this.initialGranularity_ = cvox.ChromeVox.navigationManager.getGranularity();
  cvox.ChromeVox.navigationManager.setGranularity(
      cvox.NavigationShifter.GRANULARITIES.OBJECT);

  // During profiling, NavigationHistory was found to have a serious performance
  // impact on search.
  cvox.ChromeVox.navigationManager.disableNavigationHistory();

  this.initialNode_ =
      cvox.ChromeVox.navigationManager.getCurrentNode();

  this.initialFocus_ = document.activeElement;
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
cvox.SearchWidget.prototype.hide = function() {
  if (this.isActive()) {
    var containerNode = this.containerNode_;
    containerNode.style.opacity = '0.0';
    window.setTimeout(function() {
      document.body.removeChild(containerNode);
    }, 1000);
    this.txtNode_ = null;
    cvox.SearchWidget.containerNode = null;
    cvox.ChromeVox.navigationManager.enableNavigationHistory();
    cvox.ChromeVox.navigationManager.setGranularity(this.initialGranularity_);
    cvox.ChromeVox.navigationManager.syncAll();
  }
  cvox.$m('search_widget_outro').speakFlush();

  goog.base(this, 'hide', true);
};


/**
 * @override
 */
cvox.SearchWidget.prototype.getNameMsg = function() {
  return 'search_widget_intro';
};


/**
 * @override
 */
cvox.SearchWidget.prototype.getHelp = function() {
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
          this.initialNode_);
      cvox.ChromeVox.navigationManager.syncAll();
    }
  } else if (evt.keyCode == 40) { // Down arrow
    this.next_(searchStr);
  } else if (evt.keyCode == 38) { // Up arrow
    this.prev_(searchStr);
  } else if (evt.keyCode == 13) { // Enter
    this.hide();
  } else if (evt.keyCode == 27) { // Escape
    this.hide();
    cvox.ApiImplementation.syncToNode(this.initialNode_,
                                      true,
                                      cvox.AbstractTts.QUEUE_MODE_QUEUE);
    if (this.initialFocus_) {
      cvox.ChromeVox.markInUserCommand();
      cvox.Focuser.setFocus(this.initialFocus_);
    } else if (document.activeElement) {
      document.activeElement.blur();
    }
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
  overlayNode.style['z-index'] = '10001';
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
  if (!this.caseSensitive_) {
    searchStr = searchStr.toLowerCase();
  }

  do {
    cvox.ChromeVox.navigationManager.setGranularity(
        cvox.NavigationShifter.GRANULARITIES.OBJECT);
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
  } while (cvox.ChromeVox.navigationManager.navigate(true));
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
 * Goes to the next matching result.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.next_ = function(searchStr) {
  cvox.ChromeVox.navigationManager.setReversed(false);
  cvox.ChromeVox.navigationManager.navigate();
  var result = this.getNextResult_(searchStr);
  this.outputSearchResult_(result);
};


/**
 * Goes to the previous matching result.
 *
 * @param {string} searchStr The text to search for.
 * @private
 */
cvox.SearchWidget.prototype.prev_ = function(searchStr) {
  cvox.ChromeVox.navigationManager.setReversed(true);
  cvox.ChromeVox.navigationManager.navigate();
  var result = this.getNextResult_(searchStr);
  this.outputSearchResult_(result);
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
  if (!result) {
    cvox.ChromeVox.tts.stop();
    cvox.$m('search_widget_no_results').speakFlush();
    cvox.ChromeVox.earcons.playEarcon(cvox.AbstractEarcons.WRAP);
    return;
  }

  // Speak the modified description and some instructions.
  cvox.ChromeVox.navigationManager.speakDescriptionArray(
      result,
      cvox.AbstractTts.QUEUE_MODE_FLUSH,
      null);

  cvox.ChromeVox.tts.speak('Press enter to accept or escape to cancel, ' +
      'down for next and up for previous.',
                           cvox.AbstractTts.QUEUE_MODE_QUEUE,
                           cvox.AbstractTts.PERSONALITY_ANNOTATION);

  cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
    cvox.ChromeVox.navigationManager.syncAll();
  });
};
