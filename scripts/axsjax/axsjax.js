// Copyright 2007 Google Inc.
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

goog.provide('cvox.AxsJAX');

goog.require('cvox.ChromeVox');
goog.require('cvox.DomUtil');
goog.require('cvox.XpathUtil');

/**
 * @fileoverview AxsJAX - JavaScript library for enhancing the accessibility
 * of AJAX apps through WAI-ARIA.
 * Note that this is a ChromeVox specific version of AxsJAX that has been
 * optimized and refactored for ChromeVox.
 * @author clchen@google.com (Charles L. Chen)
 */

/**
 * Class of scripts for improving accessibility of Web 2.0  Apps.
 * @param {boolean} useTabKeyFix  Whether or not to try syncing to the last
 *                                marked position when the user presses the
 *                                tab key.
 * @constructor
 */
cvox.AxsJAX = function(useTabKeyFix) {
  this.ID_NUM_ = 0;
  this.tabbingStartPosNode_ = null;
  this.tabKeyFixOn_ = false;
  this.lastFocusedNode = null;
  this.inputFocused = false;

  var self = this;

  //Monitor focus and blur
  this.addFocusBlurMonitors();

  //Activate the tab key fix if needed
  if (useTabKeyFix) {
    this.tabKeyFixOn_ = true;
    document.addEventListener('keypress',
                              function(event) {
                                self.tabKeyHandler(event, self);
                              },
                              true);
    // Record in a custom DOM property:
    document.body.AXSJAX_TABKEYFIX_ADDED = true;
  }
};


/**
 * Adds focus/blur handlers to the current active document.
 * This should be invoked when AxsJAX is first initialized and
 * when a new active document has been set.
 */
cvox.AxsJAX.prototype.addFocusBlurMonitors = function() {
  var activeDoc = this.getActiveDocument();
  var self = this;
  //These return "true" so that any page actions based on
  //focus and blur will still occur.
  var focusHandler = function(evt) {
        self.lastFocusedNode = evt.target;
        if ((evt.target.tagName == 'INPUT') ||
            (evt.target.tagName == 'SELECT') ||
            (evt.target.tagName == 'TEXTAREA')) {
          self.inputFocused = true;
        }
        return true;
      };
  activeDoc.addEventListener('focus', focusHandler, true);

  var blurHandler = function(evt) {
        self.lastFocusedNode = null;
        if ((evt.target.tagName == 'INPUT') ||
            (evt.target.tagName == 'SELECT') ||
            (evt.target.tagName == 'TEXTAREA')) {
          self.inputFocused = false;
        }
        return true;
      };
  activeDoc.addEventListener('blur', blurHandler, true);
};


/**
 * This function is not needed in Chrome Vox and is a no-op. It is available
 * only as a compatibility shim for existing AxsJAX scripts.
 *
 * @param {Node} targetNode Dummy node - this is not used.
 */
cvox.AxsJAX.prototype.setActiveParent = function(targetNode) {
};


/**
 * This function is not needed in Chrome Vox and is the same as just calling
 * "document".
 * Gets the document for the active parent.
 * @return {Node} The document that is the ancestor for the active parent.
 */
cvox.AxsJAX.prototype.getActiveDocument = function() {
  return document;
};


/**
 * Speaks a given node using ChromeVox.
 * @param {Node} targetNode The HTML node to be spoken.
 */
cvox.AxsJAX.prototype.speakNode = function(targetNode) {
  ChromeVox.tts.speak(DomUtil.getText(targetNode), 0, null);
};


/**
 * Speaks the given textString using ChromeVox.
 * @param {String} textString The text to be spoken.
 */
cvox.AxsJAX.prototype.speakText = function(textString) {
  ChromeVox.tts.speak(textString, 0, null);
};

/**
 * Speaks the given textString using ChromeVox.
 * This function is the same as speakText as is available only as a
 * compatibility shim for existing AxsJAX scripts.
 *
 * @param {String} textString The text to be spoken.
 *
 */
cvox.AxsJAX.prototype.speakTextViaNode = function(textString) {
  ChromeVox.tts.speak(textString, 0, null);
};

/**
 * Puts alt='' for all images that are children of the target node that
 * have no alt text defined. This is a bandage fix to prevent screen readers
 * from rambling on by reading the URL string of the image.
 * A real fix for this problem should be to either use appropriate alt text for
 * the images or explicitly put alt='' for images that have no semantic value.
 * @param {Node} targetNode The target node of this operation.
 */
cvox.AxsJAX.prototype.putNullForNoAltImages = function(targetNode) {
  var images = targetNode.getElementsByTagName('img');
  for (var i = 0, image; image = images[i]; i++) {
    if (!image.alt) {
      image.alt = '';
    }
  }
};


/**
 * Dispatches a left click event on the element that is the targetNode.
 * Clicks go in the sequence of mousedown, mouseup, and click.
 * This functionality already exists in DomUtil, so this method simply
 * redirects to that.
 *
 * @param {Node} targetNode The target node of this operation.
 * @param {boolean} shiftKey Specifies if shift is held down.
 */
cvox.AxsJAX.prototype.clickElem = function(targetNode, shiftKey) {
  DomUtil.clickElem(targetNode, shiftKey);
};

/**
 * Dispatches a key event on the element that is the targetNode.
 * @param {Node} targetNode The target node of this operation.
 * @param {String} theKey The key to use for this operation.
 *                        This can be any single printable character or ENTER.
 * @param {Boolean} holdCtrl Whether or not the Ctrl key should be held for
 *                        this operation.
 * @param {Boolean} holdAlt Whether or not the Alt key should be held for
 *                       this operation.
 * @param {Boolean} holdShift Whether or not the Shift key should be held
 *                         for this operation.
 */
cvox.AxsJAX.prototype.sendKey = function(targetNode, theKey,
                                    holdCtrl, holdAlt, holdShift) {
  var keyCode = 0;
  var charCode = 0;
  if (theKey == 'ENTER') {
    keyCode = 13;
  }
  else if (theKey.length == 1) {
    charCode = theKey.charCodeAt(0);
  }
  var activeDoc = this.getActiveDocument();
  var evt = activeDoc.createEvent('KeyboardEvent');
  evt.initKeyEvent('keypress', true, true, null, holdCtrl,
                   holdAlt, holdShift, false, keyCode, charCode);
  targetNode.dispatchEvent(evt);
};

/**
 * Assigns an ID to the targetNode.
 * If targetNode already has an ID, this is a no-op.
 * Always returns the ID of targetNode.
 * If targetNode is null, we return ''
 * @param {Node} targetNode The target node of this operation.
 * @param {String} opt_prefixString
 * Prefix to help ensure the uniqueness of the ID.
 * This is optional; if null, it will use "AxsJAX_ID_".
 * @return {string} The ID that the targetNode now has.
 */
cvox.AxsJAX.prototype.assignId = function(targetNode, opt_prefixString) {
  if (!targetNode) {
    return '';
  }
  if (targetNode.id) {
    return targetNode.id;
  }
  var prefix = opt_prefixString || 'AxsJAX_ID_';
  targetNode.id = prefix + this.ID_NUM_++;
  return targetNode.id;
};

/**
 * Marks the current position by remembering what the last focusable node was.
 * The focusable node will be the targetNode if it has a focus() function, or
 * if it does not, the first descendent node that it has which does.
 * If the targetNode itself and all of its descendents have no focus() function,
 * this function will complete with failure.
 * If the cvox.AxsJAX.tabKeyHandler is used, then it will put the focus on this
 * node.
 * @param {Node} targetNode The target node of this operation.
 * @return {Boolean} True if the position was marked successfully.
 *                   False if failed.
 */
cvox.AxsJAX.prototype.markPosition = function(targetNode) {
  if (!targetNode) {
    return false;
  }
  ChromeVox.navigationManager.syncToNode(targetNode);
  if ((targetNode.tagName == 'A') || (targetNode.tagName == 'INPUT')) {
    this.tabbingStartPosNode_ = targetNode;
    return true;
  }
  var allDescendants = targetNode.getElementsByTagName('*');
  for (var i = 0, currentNode; currentNode = allDescendants[i]; i++) {
    if ((currentNode.tagName == 'A') ||
        (currentNode.tagName == 'INPUT') ||
        (currentNode.hasAttribute('tabindex') &&
         (currentNode.tabIndex != -1))) {
      this.tabbingStartPosNode_ = currentNode;
      return true;
    }
  }
  return false;
};

/**
 * Restores the focus .
 * Usage:
 *   var myAxsJAXObj = new AxsJAX();
 *   document.addEventListener('keypress',
 *       function(event){
 *         myAxsJAXObj.tabKeyHandler(event,myAxsJAXObj);
 *       },
 *       true);
 * @param {Event} evt The event.
 * @param {Object} selfRef The AxsJAX object. A self reference is needed here
 *                         since this in an event handler does NOT refer to the
 *                         AxsJAX object.
 * @return {Boolean} Always returns true to pass the tab key along.
 */
cvox.AxsJAX.prototype.tabKeyHandler = function(evt, selfRef) {
  if (!selfRef.tabKeyFixOn_) {
    return true;
  }
  if ((evt.keyCode == 9) && (selfRef.tabbingStartPosNode_)) {
    selfRef.tabbingStartPosNode_.focus();
    selfRef.tabbingStartPosNode_ = null;
  }
  return true;
};

/**
 * Scrolls to the targetNode and speaks it.
 * This will automatically mark the position; this should be used if you are
 * navigating through content.
 * @param {Node} targetNode The HTML node to be spoken.
 */
cvox.AxsJAX.prototype.goTo = function(targetNode) {
  this.speakNode(targetNode);
  targetNode.scrollIntoView(true);
  this.markPosition(targetNode);
};


/**
 * Sets the attribute of the targetNode to the value.
 * Use this rather than a direct set attribute to abstract away ARIA
 * naming changes.
 * @param {Node} targetNode The HTML node to have the attribute set on.
 * @param {string} attribute The attribute to set.
 * @param {string?} value The value the attribute should be set to.
 */
cvox.AxsJAX.prototype.setAttributeOf = function(targetNode, attribute, value) {
  if (!targetNode) {
    return;
  }
  //Add the aria- to attributes
  attribute = attribute.toLowerCase();
  switch (attribute) {
    case 'live':
      attribute = 'aria-live';
      break;
    case 'activedescendant':
      attribute = 'aria-activedescendant';
      break;
    case 'atomic':
      attribute = 'aria-atomic';
      break;
    default:
      break;
  }
  targetNode.setAttribute(attribute, value);
};

/**
 * Gets the attribute of the targetNode.
 * Use this rather than a direct get attribute to abstract away ARIA
 * naming changes.
 * @param {Node} targetNode The HTML node to get the attribute of.
 * @param {string} attribute The attribute to get the value of.
 * @return {string} The value of the attribute of the targetNode.
 */
cvox.AxsJAX.prototype.getAttributeOf = function(targetNode, attribute) {
  return targetNode.getAttribute(attribute);
};

/**
 * Removes the attribute of the targetNode.
 * Use this rather than a direct remove attribute to abstract away ARIA
 * naming changes.
 * @param {Node} targetNode The HTML node to remove the attribute from.
 * @param {string} attribute The attribute to be removed.
 */
cvox.AxsJAX.prototype.removeAttributeOf = function(targetNode, attribute) {
  if (targetNode && targetNode.removeAttribute) {
    targetNode.removeAttribute(attribute);
  }
};

/**
 * This is a no-op for ChromeVox since ChromeVox is the AT and does not need to
 * be synced. This function is available only as a compatibility shim.
 *
 * @param {Node} targetNode The HTML node to force the AT to sync to.
 */
cvox.AxsJAX.prototype.forceATSync = function(targetNode) {

};

/**
 * Given an XPath expression and rootNode, it returns an array of children nodes
 * that match.
 * This functionality already exists in XpathUtil, so this method simply
 * redirects to that.
 * @param {string} expression The XPath expression to evaluate.
 * @param {Node} rootNode The HTML node to start evaluating the XPath from.
 * @return {Array} The array of children nodes that match.
 */
cvox.AxsJAX.prototype.evalXPath = function(expression, rootNode) {
  return cvox.XpathUtil.evalXPath(expression, rootNode);
};

/**
 * This function initializes an AxsJAX script by calling a given initialization
 * routine after the page load event has been generated. Using
 * this method instead of attaching the event listener directly is recommended
 * to enable testability of the application.
 *
 * @param {Function!} initFunction The initialization function to invoke.
 */
cvox.AxsJAX.initializeOnLoad = function(initFunction) {
  window.addEventListener('load', function() {
    initFunction();
  }, true);
};
