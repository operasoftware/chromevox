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

/**
 * @fileoverview AxsJAX - JavaScript library for enhancing the accessibility
 * of AJAX apps through WAI-ARIA.
 * Note that IE does not implement WAI-ARIA; thus these scripts are specific
 * to Firefox.
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('axsjax.common.AxsJAX');

// Don't break closure apps that expect 'AxsJAX'.
goog.provide('AxsJAX');

/**
 * Class of scripts for improving accessibility of Web 2.0  Apps.
 * @param {boolean} useTabKeyFix  Whether or not to try syncing to the last
 *                                marked position when the user presses the
 *                                tab key.
 * @constructor
 */
var AxsJAX = function(useTabKeyFix){
  this.ID_NUM_ = 0;
  this.tabbingStartPosNode = null;
  this.tabKeyFixOn = false;
  this.lastFocusedNode = null;
  this.inputFocused = false;

  var self = this;
  this.activeParent = document.body;

  //Monitor focus and blur
  this.addFocusBlurMonitors();

  //Activate the tab key fix if needed
  if (useTabKeyFix){
    this.tabKeyFixOn = true;
    document.addEventListener('keypress',
                              function(event){
                                self.tabKeyHandler(event, self);
                              },
                              true);
    // Record in a custom DOM property:
    document.body.AXSJAX_TABKEYFIX_ADDED = true;
  }
  // Identify the scripted web app as an application and not a document
  this.setAttributeOf(document.body, 'role', 'application');
};


/**
 * Adds focus/blur handlers to the current active document.
 * This should be invoked when AxsJAX is first initialized and
 * when a new active document has been set.
 */
AxsJAX.prototype.addFocusBlurMonitors = function(){
  var activeDoc = this.getActiveDocument();
  var self = this;
  //These return "true" so that any page actions based on
  //focus and blur will still occur.
  var focusHandler = function(evt){
                       self.lastFocusedNode = evt.target;
                       if ((evt.target.tagName == 'INPUT') ||
                           (evt.target.tagName == 'SELECT') ||
                           (evt.target.tagName == 'TEXTAREA')){
                         self.inputFocused = true;
                       }
                       return true;
                     };
  activeDoc.addEventListener('focus', focusHandler, true);

  var blurHandler = function(evt){
                      self.removeAttributeOf(self.lastFocusedNode,
                                             'aria-activedescendant');
                      self.lastFocusedNode = null;
                      if ((evt.target.tagName == 'INPUT') ||
                          (evt.target.tagName == 'SELECT') ||
                          (evt.target.tagName == 'TEXTAREA')){
                        self.inputFocused = false;
                      }
                      return true;
                    };
  activeDoc.addEventListener('blur', blurHandler, true);
};


/**
 * AxsJAX causes assistive technologies to speak by using the activedescendant
 * property. Usually, the activedescendant should be set on the document.body
 * object and this is the default if setActiveParent is never called. However,
 * if the node to be spoken is inside an iframe, then it can
 * not be referenced by its ID from the parent document. Thus activedescendant
 * will not work. The solution is to use setActiveParent to set the active
 * parent that AxsJAX is using to the child iframe's document.body.
 * @param {Node} targetNode The HTML node to be used as the active parent.
 */
AxsJAX.prototype.setActiveParent = function(targetNode){
  this.activeParent = targetNode;
  var activeDoc = this.getActiveDocument();
  if (this.tabKeyFixOn && !activeDoc.body.AXSJAX_TABKEYFIX_ADDED){
    var self = this;
    activeDoc.addEventListener('keypress',
                               function(event){
                                 self.tabKeyHandler(event, self);
                               },
                               true);
    activeDoc.body.AXSJAX_TABKEYFIX_ADDED = true;
  }
  this.addFocusBlurMonitors();
};


/**
 * Gets the document for the active parent.
 * @return {Node} The document that is the ancestor for the active parent.
 */
AxsJAX.prototype.getActiveDocument = function(){
  var activeDoc = this.activeParent;
  while (activeDoc.nodeType != 9){ // 9 == DOCUMENT_NODE
    activeDoc = activeDoc.parentNode;
  }
  return activeDoc;
};


/**
 * Triggers a DOMNodeInserted event on an HTML element node.
 * AT will respond by reading the content of the node.
 * This should NOT be called on any node which already has
 * live region markup as it will cause that markup to be overridden.
 * Note that any further modifications to this node will
 * also be spoken immediately.
 * This should be used in cases where the nodes are already loaded,
 * the user is navigating between the nodes, and it is desirable
 * to mirror the visual indication that a node is the current node
 * by speaking its contents as soon as as it becomes the current node.
 * @param {Node} targetNode The HTML node to be spoken.
 * @param {boolean} opt_noFocusChange  Specify if focus must move to targetNode.
 */
AxsJAX.prototype.speakNode = function(targetNode, opt_noFocusChange){
  if (!targetNode.id){
    this.assignId(targetNode);
  }
  if (opt_noFocusChange){
    this.setAttributeOf(targetNode, 'live', 'rude');
    this.setAttributeOf(targetNode, 'atomic', 'true');
    var activeDoc = this.getActiveDocument();

    // It would be simpler to retain the dummyNode once it has been created
    // and change its textContent; however that fails to trigger the update
    // events we need. So we create a new node, taking care to remove any
    // previously created dummyNode.
    var dummyNode = activeDoc.createElement('div');
    dummyNode.textContent = ' ';
    dummyNode.name = 'AxsJAX_dummyNode';
    if (targetNode.lastChild &&
        targetNode.lastChild.name &&
        (targetNode.lastChild.name == dummyNode.name)){
      targetNode.removeChild(targetNode.lastChild);
    }
    targetNode.appendChild(dummyNode);
  } else {
    var oldRole = this.getAttributeOf(targetNode, 'role');
    this.setAttributeOf(targetNode, 'role', 'row');
    var currentFocusedNode = this.lastFocusedNode;
    // Use the body if there is no last focused node or
    // if the last focused node is the entire document.
    if ((!currentFocusedNode) || (currentFocusedNode.nodeType == 9)){
      this.activeParent.tabIndex = -1;
      currentFocusedNode = this.activeParent;
    }
    this.setAttributeOf(currentFocusedNode, 'activedescendant', null);
    if (currentFocusedNode.focus) {
      currentFocusedNode.focus();
    }
    this.setAttributeOf(currentFocusedNode, 'activedescendant', targetNode.id);
    //Restore the original role of the targetNode
    var self = this;
    window.setTimeout(
        function(){
          if (oldRole){
            self.setAttributeOf(targetNode, 'role', oldRole);
          } else {
            self.removeAttributeOf(targetNode, 'role');
          }
        }, 0);
  }
};


/**
 * Triggers a DOMNodeInserted event by inserting the text to be spoken
 * into a hidden node. AT will respond by reading the content of this new node.
 * This should be used in cases a message needs to be spoken
 * to give an auditory cue for something that is shown visually.
 * A good example would be when content has loaded or is changed from
 * being hidden to being displayed; it is visually obvious, but there may not
 * be any audio cue.
 * @param {String} textString The text to be spoken.
 */
AxsJAX.prototype.speakText = function(textString){
  //Use the main window's document directly here to ensure the AT
  //receives and processes the live region event correctly.
  //Since this is only a string, it is safe to do this without considering
  //the active document of the AxsJAX object.
  var doc = window.content.document;
  var audioNode = doc.createElement('span');
  audioNode.id = 'AxsJAX_audioNode';
  this.setAttributeOf(audioNode, 'role', 'alert');
  audioNode.style.position = 'absolute';
  audioNode.style.left = '-1000em';

  var oldAudioNode = doc.getElementById(audioNode.id);
  if (oldAudioNode){
    doc.body.removeChild(oldAudioNode);
  }
  audioNode.textContent = textString;
  doc.body.appendChild(audioNode);
};

/**
 * This will insert a transparent pixel at the end of the page, put
 * the textString as the pixel's alt text, then use speakNode on the pixel.
 * This is way  of generating spoken feedback   when
 * ARIA live region support is unavailable.
 * The advantage is that it is more compatible as few assistive technologies
 * currently support live regions.
 * The disadvantage (besides being a somewhat hacky way of doing things) is
 * that it may cause problems with things which rely on focus/blur as this
 * causes focus to be set somewhere on the page.
 *
 * If there is an anchorNode specified, this function will place the pixel
 * before the anchorNode and set focus to the pixel.
 *
 * This enables AT like screenreaders  resume reading at a given position.
 * If there is no anchorNode specified, this function will append the pixel
 * as the last child to the body of the active document and call speakNode on
 * the pixel.
 *
 * @param {string} textString The text to be spoken.
 * @param {Node} opt_anchorNode The node to insert the pixel in front of.
 *
 */
AxsJAX.prototype.speakTextViaNode = function(textString, opt_anchorNode){
  var pixelId = 'AxsJAX_pixelAudioNode';
  var pixelName = 'AxsJAX_pixelAudioNode';
  var encodedClearPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAANvf7wAAA' +
                          'CH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  var activeDoc = this.getActiveDocument();
  var pixelNode = null;
  if (opt_anchorNode){
    if (opt_anchorNode.previousSibling &&
        opt_anchorNode.previousSibling.name == pixelName){
      pixelNode = opt_anchorNode.previousSibling;
    } else {
      pixelNode = activeDoc.createElement('img');
      pixelNode.name = pixelName;
      pixelNode.setAttribute('tabindex', 0);
      pixelNode.style.outline = 'none';
      pixelNode.src = encodedClearPixel;
      opt_anchorNode.parentNode.insertBefore(pixelNode, opt_anchorNode);
      this.forceATSync(pixelNode);
    }
    pixelNode.setAttribute('alt', textString);
    pixelNode.setAttribute('title', textString);
    // Use a setTimeout here as Firefox attribute setting can be quirky
    // (tabIndex is not always set soon enough).
    window.setTimeout(function(){pixelNode.blur();pixelNode.focus();}, 0);
  } else {
    pixelNode = activeDoc.getElementById(pixelId);
    if (pixelNode && (pixelNode.alt == textString)){
      textString = textString + ' ';
    }
    if (!pixelNode){
      pixelNode = activeDoc.createElement('img');
      pixelNode.id = pixelId;
      pixelNode.src = encodedClearPixel;
      activeDoc.body.appendChild(pixelNode);
    }
    pixelNode.setAttribute('alt', textString);
    pixelNode.setAttribute('title', textString);

    this.speakNode(pixelNode);
  }
};

/**
 * Puts alt='' for all images that are children of the target node that
 * have no alt text defined. This is a bandage fix to prevent screen readers
 * from rambling on by reading the URL string of the image.
 * A real fix for this problem should be to either use appropriate alt text for
 * the images or explicitly put alt='' for images that have no semantic value.
 * @param {Node} targetNode The target node of this operation.
 */
AxsJAX.prototype.putNullForNoAltImages = function(targetNode){
  var images = targetNode.getElementsByTagName('img');
  for (var i = 0, image; image = images[i]; i++) {
    if (!image.alt){
      image.alt = '';
    }
  }
};


/**
 * Dispatches a left click event on the element that is the targetNode.
 * Clicks go in the sequence of mousedown, mouseup, and click.
 * @param {Node} targetNode The target node of this operation.
 * @param {boolean} shiftKey Specifies if shift is held down.
 */
AxsJAX.prototype.clickElem = function(targetNode, shiftKey){
  var activeDoc = this.getActiveDocument();
  //Send a mousedown
  var evt = activeDoc.createEvent('MouseEvents');
  evt.initMouseEvent('mousedown', true, true, activeDoc.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try{
    targetNode.dispatchEvent(evt);
  } catch (e){}
  //Send a mouse up
  evt = activeDoc.createEvent('MouseEvents');
  evt.initMouseEvent('mouseup', true, true, activeDoc.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try{
    targetNode.dispatchEvent(evt);
  } catch (e){}
  //Send a click
  evt = activeDoc.createEvent('MouseEvents');
  evt.initMouseEvent('click', true, true, activeDoc.defaultView,
                     1, 0, 0, 0, 0, false, false, shiftKey, false, 0, null);
  //Use a try block here so that if the AJAX fails and it is a link,
  //it can still fall through and retry by setting the document.location.
  try{
    targetNode.dispatchEvent(evt);
  } catch (e){}
  //Clicking on a link does not cause traversal because of script
  //privilege limitations. The traversal has to be done by setting
  //document.location.
  var href = targetNode.getAttribute('href');
  if ((targetNode.tagName == 'A') &&
       href &&
      (href != '#')){
    if (shiftKey){
      window.open(targetNode.href);
    } else {
      document.location = targetNode.href;
    }
  }

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
AxsJAX.prototype.sendKey = function(targetNode, theKey,
                                    holdCtrl, holdAlt, holdShift){
  var keyCode = 0;
  var charCode = 0;
  if (theKey == 'ENTER'){
    keyCode = 13;
  }
  else if (theKey.length == 1){
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
AxsJAX.prototype.assignId = function(targetNode, opt_prefixString){
  if (!targetNode){
    return '';
  }
  if (targetNode.id){
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
 * If the AxsJAX.tabKeyHandler is used, then it will put the focus on this node.
 * @param {Node} targetNode The target node of this operation.
 * @return {boolean} True if the position was marked successfully.
 *                   False if failed.
 */
AxsJAX.prototype.markPosition = function(targetNode){
  if (!targetNode){
    return false;
  }
  if ((targetNode.tagName == 'A') || (targetNode.tagName == 'INPUT')){
    this.tabbingStartPosNode = targetNode;
    return true;
  }
  var allDescendants = targetNode.getElementsByTagName('*');
  for (var i = 0, currentNode; currentNode = allDescendants[i]; i++){
    if ((currentNode.tagName == 'A') ||
        (currentNode.tagName == 'INPUT') ||
        (currentNode.hasAttribute('tabindex') &&
         (currentNode.tabIndex != -1))){
      this.tabbingStartPosNode = currentNode;
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
 * @return {boolean} Always returns true to pass the tab key along.
 */
AxsJAX.prototype.tabKeyHandler = function(evt, selfRef){
  if (!selfRef.tabKeyFixOn){
    return true;
  }
  if ((evt.keyCode == 9) && (selfRef.tabbingStartPosNode)){
    selfRef.tabbingStartPosNode.focus();
    selfRef.tabbingStartPosNode = null;
  }
  return true;
};

/**
 * Scrolls to the targetNode and speaks it.
 * This will automatically mark the position; this should be used if you are
 * navigating through content.
 * @param {Node} targetNode The HTML node to be spoken.
 */
AxsJAX.prototype.goTo = function(targetNode){
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
AxsJAX.prototype.setAttributeOf = function(targetNode, attribute, value){
  if (!targetNode){
    return;
  }
  //Add the aria- to attributes
  attribute = attribute.toLowerCase();
  switch (attribute){
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
AxsJAX.prototype.getAttributeOf = function(targetNode, attribute){
  return targetNode.getAttribute(attribute);
};

/**
 * Removes the attribute of the targetNode.
 * Use this rather than a direct remove attribute to abstract away ARIA
 * naming changes.
 * @param {Node} targetNode The HTML node to remove the attribute from.
 * @param {string} attribute The attribute to be removed.
 */
AxsJAX.prototype.removeAttributeOf = function(targetNode, attribute){
  if (targetNode && targetNode.removeAttribute){
    targetNode.removeAttribute(attribute);
  }
};

/**
 * Sets the location of the active document. This will force
 * assistive technologies that use a browse vs forms mode system
 * to be synced to the targetNode.
 * @param {Node} targetNode The HTML node to force the AT to sync to.
 */
AxsJAX.prototype.forceATSync = function(targetNode){
  var id = this.assignId(targetNode);
  var activeDoc = this.getActiveDocument();
  var loc = activeDoc.baseURI;
  var indexOfHash = loc.indexOf('#');
  if (indexOfHash != -1){
    loc = loc.substring(0, indexOfHash);
  }
  activeDoc.location = loc + '#' + id;
};

/**
 * Given an XPath expression and rootNode, it returns an array of children nodes
 * that match. The code for this function was taken from Mihai Parparita's GMail
 * Macros Greasemonkey Script.
 * http://gmail-greasemonkey.googlecode.com/svn/trunk/scripts/gmail-new-macros.user.js
 * @param {string} expression The XPath expression to evaluate.
 * @param {Node} rootNode The HTML node to start evaluating the XPath from.
 * @return {Array} The array of children nodes that match.
 */
AxsJAX.prototype.evalXPath = function(expression, rootNode) {
  try {
    var xpathIterator = rootNode.ownerDocument.evaluate(
      expression,
      rootNode,
      null, // no namespace resolver
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null); // no existing results
  } catch (err) {
    return [];
  }
  var results = [];
  // Convert result to JS array
  for (var xpathNode = xpathIterator.iterateNext();
       xpathNode;
       xpathNode = xpathIterator.iterateNext()) {
    results.push(xpathNode);
  }
  return results;
};

/**
 * This function initializes an AxsJAX script by calling a given initialization
 * routine after the page load event has been generated. Using
 * this method instead of attaching the event listener directly is recommended
 * to enable testability of the application.
 *
 * @param {Function!} initFunction The initialization function to invoke.
 */
AxsJAX.initializeOnLoad = function(initFunction) {
  window.addEventListener('load', function() {
    initFunction();
  }, true);
};

axsjax.common.AxsJAX = AxsJAX;

goog.exportSymbol('AxsJAX', AxsJAX);
