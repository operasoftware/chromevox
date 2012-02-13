// Copyright 2011 Google Inc.
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
 * @fileoverview This file contains cvox.BaseModifier, which provides
 * the base functionality of removing all visual styling from the
 * page.  It's intended to be subclassed by specific "skins" that
 * apply custom styling and annotations to the page.
 *
 * This class is responsible for four main things:
 *
 * 1. Removing most rules from the page stylesheets. We need to preserve
 *    some portions of rules when they deal with display and visibility.
 *    When a stylesheet can't be modified (due to origin), we disable it,
 *    then request the background page fetch a new copy that can be
 *    inserted with modifications.
 *
 * 2. Iterating over all DOM nodes and removing most inline styling and
 *    style-related HTML attributes. In a few cases, new styles are added.
 *
 * 3. Installing listeners so that we can re-process the DOM and styles
 *    whenever the page changes.
 *
 * 4. Communicating with iframes and parent windows, and resizing
 *    iframes based on their reported content height (so that no iframes
 *    scroll).
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.BaseModifier');

goog.require('cvox.DomUtil');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.Interframe');


/**
 * Information about an iframe on this page.
 * @param {Element} element The iframe element.
 * @param {number} height The height of the iframe.
 * @constructor
 */
cvox.IFrameInfo = function(element, height) {
  this.element = element;
  this.height = height;
};


/**
 * Constructs a cvox.BaseModifier.
 * @constructor
 */
cvox.BaseModifier = function() {
  /**
   * A DOM element we add to the page that's the root of all
   * (absolute-positioned) annotations we add.
   * @type {Element}
   */
  this.annotations = null;

  /**
   * Whether we've installed a DOMSubtreeModified listener.
   * @type {boolean}
   */
  this.listenerInstalled = false;

  /**
   * Map from integer ID to info about an iframe on the page.
   * @type {Object.<number,cvox.IFrameInfo>}
   */
  this.iframes = {};

  /**
   * Count of the number of iframes we've seen on this page, so we can
   * give each one an unique ID.
   * @type {number}
   */
  this.iframeCount = 0;

  /**
   * The height of the content of this page in pixels.
   * @type {number}
   */
  this.height = -1;

  /**
   * The last time when we processed the full DOM.
   * @type {Date}
   */
  this.lastProcessTime = null;

  /**
   * The minimum delay before we next process the DOM again.
   * @type {number}
   */
  this.minimumReprocessDelay = 0;

  /**
   * If a timer was set to reprocess the DOM.
   * @type {boolean}
   */
  this.reprocessTimerSet = false;

  // Start listening to messages from parent and child frames.
  this.addCrossFrameMessageListener();
};

/**
 * @type {string}
 * @const
 */
cvox.BaseModifier.IFRAME_HEIGHT = 'IFrame Height';

/**
 * Start processing the page. Assumes the page is initially hidden, and
 * won't be revealed until initial processing is done.
 */
cvox.BaseModifier.prototype.enable = function() {
  this.processStyleSheets(true);
};

/**
 * Scan all stylesheets on the page.
 * @param {boolean} firstTime True if the page hasn't been revealed yet.
 */
cvox.BaseModifier.prototype.processStyleSheets = function(firstTime) {
  var hrefs = [];
  var changed = false;
  for (var i = 0; i < document.styleSheets.length; i++) {
    var styleSheet = document.styleSheets[i];
    if (styleSheet.disabled) {
      continue;
    }
    if (styleSheet.ownerNode.hasAttribute('chromeshades')) {
      var count = parseInt(
          styleSheet.ownerNode.getAttribute('chromeshades'), 10);
      if (count == styleSheet.cssRules.length) {
        continue;
      }
    }
    changed = true;

    if (styleSheet.cssRules) {
      // The stylesheet is modifiable - we can fix it up in place.
      var count = this.fixModifiableStyleSheet(styleSheet);
      styleSheet.ownerNode.setAttribute('chromeshades', '' + count);
    } else if (styleSheet.href) {
      // This stylesheet is not modifiable, probably because of the origin.
      // Send a request to the background page to fetch the contents again.
      // When we receive the new contents, we disable the old sheet and
      // add the replacement, then fix the replacement.
      hrefs.push(styleSheet.href);
    }
  }

  if (changed || firstTime) {
    if (hrefs.length > 0) {
      var styleSheetRequest = {
          'command': 'stylesheet_request',
          'firstTime': firstTime,
          'hrefs': hrefs};
      cvox.ExtensionBridge.send(styleSheetRequest);
    } else {
      this.finishStyleSheetPrep(firstTime);
    }
  }
};

/**
 * Receive stylesheets from the background page.
 * @param {Object} message The response object from the background page.
 */
cvox.BaseModifier.prototype.handleStyleSheetResponse = function(message) {
  for (var url in message['stylesheets']) {
    if (url == 'count') {
      continue;
    }
    this.addInlineStyleSheet(true, message['stylesheets'][url]);
  }

  window.setTimeout(goog.bind(function() {
    this.finishStyleSheetPrep(message['firstTime']);
  }, this), 0);
};

/**
 * Add a stylesheet to the page.
 * @param {boolean} process Whether we should process/fix this stylesheet
 *     to remove "bad" styles.
 * @param {string} styleSheetText The CSS content.
 */
cvox.BaseModifier.prototype.addInlineStyleSheet = function(
    process, styleSheetText) {
  var index = document.styleSheets.length;
  var sheet = document.createElement('style');
  sheet.type = 'text/css';
  sheet.innerHTML = styleSheetText;
  sheet.setAttribute('chromeshades', '0');
  document.head.appendChild(sheet);
  if (process) {
    window.setTimeout(goog.bind(function() {
      if (document.styleSheets[index] &&
          document.styleSheets[index].cssRules) {
        var count = this.fixModifiableStyleSheet(document.styleSheets[index]);
        sheet.setAttribute('chromeshades', '' + count);
      }
    }, this), 0);
  }
};

/**
 * Given a stylesheet, fixes all of the rules so that only display and
 * visibility rules survive. Everything else is taken away.
 * @param {CSSStyleSheet} sheet The stylesheet element.
 * @return {number} The number of rules in this sheet.
 */
cvox.BaseModifier.prototype.fixModifiableStyleSheet = function(sheet) {
  var count = sheet.cssRules.length;
  for (var j = 0; j < count; j++) {
    var rule = sheet.cssRules[j];
    if (!rule || !rule.style) {
      continue;
    }
    var visibilityValue = rule.style.getPropertyValue('visibility');
    var visibilityPriority = rule.style.getPropertyPriority('visibility');
    var visibilityCssText;
    if (visibilityValue && visibilityPriority) {
      visibilityCssText =
          'visibility:' + visibilityValue + ' !' + visibilityPriority + ';';
    } else if (visibilityValue) {
      visibilityCssText = 'visibility:' + visibilityValue + ';';
    } else {
      visibilityCssText = '';
    }

    var displayValue = rule.style.getPropertyValue('display');
    var displayPriority = rule.style.getPropertyPriority('display');
    var displayCssText;
    if (displayValue && displayPriority) {
      displayCssText =
          'display:' + displayValue + ' !' + displayPriority + ';';
    } else if (displayValue) {
      displayCssText = 'display:' + displayValue + ';';
    } else {
      displayCssText = '';
    }

    rule.style.cssText = visibilityCssText + displayCssText;
  }
  return count;
};

/**
 * This is called when all requested stylesheets have been received from the
 * background page. Iterate over all stylesheets on the page and disable
 * those that weren't modified by ChromeShades. Then, if |firstTime| is
 * true, make other DOM modifications and then reveal the page.
 * @param {boolean} firstTime True if the page hasn't been revealed yet.
 */
cvox.BaseModifier.prototype.finishStyleSheetPrep = function(firstTime) {
  // Disable all non-ChromeShades stylesheets
  for (var i = 0; i < document.styleSheets.length; i++) {
    var styleSheet = document.styleSheets[i];
    if (!styleSheet.ownerNode.hasAttribute('chromeshades')) {
      styleSheet.disabled = true;
    }
  }

  if (firstTime) {
    // Get rid of "Loading..." and display:none from the body,
    // so we can do style calculations, but keep the page invisible
    // so the user doesn't see any flicker.
    document.body.setAttribute('chromeshades_show', '1');

    // Finish processing the DOM.
    try {
      this.processDOM();
    } catch (e) {
    }
    try {
      this.finishProcessingAfterProcessDOM();
    } catch (e) {
    }

    this.lastProcessTime = new Date();
    this.minimumReprocessDelay = 1000;

    // Now reveal the page.
    document.body.setAttribute('chromeshades_show', '2');

    // Set up an onIdle timer.
    window.setInterval(goog.bind(this.onIdle, this), 5000);
  }
};

/**
 * Handle information from the background page about resources that
 * weren't loaded.
 * @param {Object} message The response message with stats (not used).
 */
cvox.BaseModifier.prototype.handleSkippedResourceResponse = function(message) {
};

/**
 * Utility function to iterate over all nodes in a subtree of the page
 * and call an action function on each one.
 * @param {Element} root The root node.
 * @param {Function} action The function to call on each node.
 */
cvox.BaseModifier.prototype.forAllNodes = function(root, action) {
  var node = root.firstChild;
  while (node && node != root) {
    if (node != this.annotations && node.id != 'screen') {
      var style = window.getComputedStyle(
          /** @type {Element} */(node), null);
      action(node, style);
      if (node.firstChild) {
        node = node.firstChild;
        continue;
      }
    }

    while (!node.nextSibling && node != root) {
      node = node.parentNode;
    }
    if (node != root) {
      node = node.nextSibling;
    }
  }
};

var initial = new Date();

/**
 */
cvox.BaseModifier.prototype.reprocess = function() {
  if (this.minimumReprocessDelay == 0) {
    // We haven't even processed the first time, or we're in the
    // middle of reprocessing already.
    return;
  }

  function title() {
    var h = window.location.href;
    return h.substr(h.length - 11);
  }

  var startTime = new Date();
  var remainingTime =
      this.minimumReprocessDelay - (startTime - this.lastProcessTime);
  if (remainingTime > 0) {
    if (!this.reprocessTimerSet) {
      this.reprocessTimerSet = true;
      window.setTimeout(goog.bind(this.reprocess, this), remainingTime);
    }
    return;
  }

  this.minimumReprocessDelay = 0;

  this.removeSubtreeModifiedListener();

  try {
    this.processStyleSheets(false);
  } catch (e) {
  }

  try {
    this.processDOM();
  } catch (e) {
  }

  try {
    this.finishProcessingAfterProcessDOM();
  } catch (e) {
  }

  var finishTime = new Date();
  var elapsed = finishTime - startTime;
  this.lastProcessTime = finishTime;
  this.minimumReprocessDelay = 1000 + elapsed * 2;
  this.reprocessTimerSet = false;
};

/**
 * Function that runs on idle, every few seconds or so.
 * It checks iframes that we've tracked to see if we've received each
 * one's height yet. If not, it sends the iframe an ID again, since maybe
 * it didn't receive it previously (like if it hadn't finished loading when
 * we tickled it before).
 */
cvox.BaseModifier.prototype.onIdle = function() {
  this.reprocess();
  for (var i = 0; i < this.iframeCount; i++) {
    var iframe = this.iframes[i];
    if (!iframe) {
      continue;
    }
    if (!iframe.element || !iframe.element.parentElement) {
      continue;
    }
    if (window.getComputedStyle(iframe.element, null).display == 'none') {
      continue;
    }
    cvox.Interframe.sendIdToIFrame(
        i, /** @type {HTMLIFrameElement} */(iframe.element));
  }
};

/**
 * Add a handler to listen to messages from child and parent frames.
 * The parent might send us a message indicating our ID, so we can
 * identify this frame when responding with our height. The child might
 * send us its height, so we can adjust the height of the frame and
 * reflow the layout.
 */
cvox.BaseModifier.prototype.addCrossFrameMessageListener = function() {
  cvox.Interframe.addListener(goog.bind(function(message) {
    if (message['command'] == cvox.BaseModifier.IFRAME_HEIGHT) {
      var iframeId = message['sourceId'];
      var iframeInfo = this.iframes[iframeId];
      var newHeight = parseInt(message['height'], 10);
      if (iframeInfo && newHeight != iframeInfo.height) {
        iframeInfo.height = newHeight;
        iframeInfo.element.style.height = (20 + iframeInfo.height) + 'px';
        window.setTimeout(goog.bind(function() {
          this.reprocess();
        }, this), 0);
      }
    } else if (message['command'] == cvox.Interframe.SET_ID) {
      this.sendHeightToParent();
    }
  }, this));
};

/**
 * Iterate over all node in the page's DOM and do some careful modifications
 * to remove the page's visual style and replace it with our custom style.
 *
 * For every node, we completely replacing the inline style, but
 * preserving display and visibility. In many other cases we add or
 * remove other attributes.
 *
 * This method has all of the DOM modification code that involves keeping
 * track of any global state. Modifications that can be applied to a single
 * node out of context are handled in processNode.
 *
 * It's important to never modify attributes that many pages use
 * as part of their page logic, like id, class, name, and value.
 *
 * @param {Element=} root The root node for processing.
 */
cvox.BaseModifier.prototype.processDOM = function(root) {
  if (!root) {
    root = document.body;
  }

  // Count the number of headings at each level and figure out the
  // default indentation level for each one.
  var indent = 2;
  var headingIndent = [0];
  for (var i = 1; i <= 6; i++) {
    headingIndent.push(indent);
    if (root.querySelector('H' + i)) {
      indent += 2;
    }
  }

  // Set up a stack of nodes that have their indentation set.
  indent = 0;
  var indentStack = [];
  var indentRoot = {};
  indentRoot.node = root;
  indentRoot.indent = 0;

  // Loop over all nodes
  this.forAllNodes(root, goog.bind(function(node, computedStyle) {
    // If the node is not displayed, just preserve this. We can then
    // stop processing further, with the exception of a BR, which
    // should continue processing because it affects the subsequent element.
    if (node.style && node.style.display == 'none') {
      return;
    }
    if (computedStyle && computedStyle.display == 'none') {
      if (node.constructor != HTMLBRElement) {
        return;
      }
    }

    // Images that have the alt text explicitly set to blank should be
    // removed entirely.
    if (node.constructor == HTMLImageElement &&
        node.hasAttribute('alt') && node.alt == '') {
      node.style.cssText = 'width: 0px !important;' +
                           ' height: 0px !important;' +
                           ' overflow: hidden !important;';
      return;
    }

    // Figure out the relative indentation of this node relative to
    // its offset parent.
    if (node.constructor == HTMLHeadingElement) {
      indent = headingIndent[node.tagName[1] - '0' - 1];
    }
    while (!cvox.DomUtil.isDescendantOfNode(node, indentRoot.node)) {
      indentRoot = indentStack.pop();
    }
    var relativeIndent = 0;
    if (indent != indentRoot.indent) {
      relativeIndent = indent - indentRoot.indent;
      indentStack.push(indentRoot);
      indentRoot = {};
      indentRoot.node = node;
      indentRoot.indent = indent;
    }
    if (node.constructor == HTMLHeadingElement) {
      indent = headingIndent[node.tagName[1] - '0'];
    }

    // Call processNode to add some style to the element. Subclasses
    // override this to add some more styling to this element.
    var newStyle = this.processNode(node, computedStyle, relativeIndent);

    // If this node is an iframe, make sure it's in our global map of
    // iframes, and use that map to set its height if we know it.
    var iframeInfo = null;
    if (node.constructor == HTMLIFrameElement) {
      var frameId = this.iframeCount;
      for (var i = 0; i < this.iframeCount; i++) {
        if (this.iframes[i].element == node) {
          iframeInfo = this.iframes[i];
          frameId = i;
        }
      }
      if (frameId == this.iframeCount) {
        this.iframeCount++;
        this.iframes[frameId] = new cvox.IFrameInfo(node, -1);
      }
      cvox.Interframe.sendIdToIFrame(frameId, node);

      // Set the height if we already have it.
      if (iframeInfo && iframeInfo.height > 0) {
        newStyle += ' height: ' + (20 + iframeInfo.height) + 'px !important;';
      } else {
        newStyle += ' height: 0px !important;' +
                    ' border: 0px !important;';
      }
      newStyle += ' overflow: hidden;' +
                  ' display: block;';
      node.setAttribute('scrolling', 'no');
    }

    // Make sure images display just the alt text. WebKit only displays
    // alt text if it fits, so truncate if necessary.
    if (node.constructor == HTMLImageElement) {
      if (node.hasAttribute('width')) {
        node.removeAttribute('width');
      }
      if (node.hasAttribute('height')) {
        node.removeAttribute('height');
      }
      if (node.hasAttribute('alt') && node.alt.length > 0) {
        if (node.alt.length > 30) {
          node.alt = node.alt.substr(0, 30);
        }
        newStyle += ' width: ' + node.alt.length + 'em !important;';
      }
    }

    // Apply the style to the node.
    if (node.style) {
      node.style.cssText = newStyle;
    }
  }, this));

  // Create an element that we can use as a root for all annotations,
  // and make sure it's the last element.
  if (!this.annotations || !this.annotations.parentElement) {
    this.annotations = document.createElement('div');
    this.annotations.id = 'chromeshades_annotations';
    document.body.appendChild(this.annotations);
  } else if (this.annotations.nextSibling != null) {
    document.body.removeChild(this.annotations);
    document.body.appendChild(this.annotations);
  }
};

/**
 * Process a single node and return some style to add.
 * @param {Node} node The node to examine.
 * @param {CSSStyleDeclaration} computedStyle The computed style
 *     before processing.
 * @param {number} indent The indent level of this node, relative to its
 *     offset parent.
 * @return {string} The new CSS style as text.
 */
cvox.BaseModifier.prototype.processNode = function(
    node, computedStyle, indent) {
  var newStyle = '';
  if (computedStyle) {
    newStyle = 'display: ' + computedStyle.display + ';';
  }

  var role = '';
  if (node.style) {
    role = node.getAttribute('role');
  }

  if ((computedStyle && computedStyle.visibility == 'hidden') ||
      role == 'presentation') {
    newStyle += ' width: 0px !important;' +
                ' height: 0px !important;' +
                ' overflow: hidden !important;';
  }

  if (node.style && node.style.visibility) {
    newStyle += ' visibility: ' + node.style.visibility + ';';
  }

  // The aria label or title can override the text of buttons and links.
  // It's not quite as easy to do this for other elements.
  if (node.constructor == HTMLButtonElement ||
      (node.constructor == HTMLAnchorElement && node.href) ||
      role == 'button' ||
      role == 'link') {
    if (node.hasAttribute('aria-label')) {
      node.innerText = node.getAttribute('aria-label');
    } else if (node.hasAttribute('aria-labelledby')) {
      var targetId = node.getAttribute('aria-labelledby');
      var target = document.getElementById(targetId);
      if (target) {
        node.innerText = cvox.DomUtil.getName(target);
      }
    } else if (node.hasAttribute('title')) {
      node.innerText = node.getAttribute('title');
    }
  }

  // Remove ancient pre-CSS attributes that affect the visual style of
  // a few elements.
  if (node.constructor == HTMLTableCellElement) {
    node.removeAttribute('width');
    node.removeAttribute('bgcolor');
  }
  if (node.constructor == HTMLTableRowElement) {
    node.removeAttribute('bgcolor');
  }
  if (node.constructor == HTMLTableElement) {
    node.removeAttribute('width');
    node.removeAttribute('cellpadding');
    node.removeAttribute('cellspacing');
    node.removeAttribute('bgcolor');
    node.border = '0';
  }

  return newStyle;
};

/**
 * Send the height of this page to our parent window, so it can size
 * the iframe appropriately.
 */
cvox.BaseModifier.prototype.sendHeightToParent = function() {
  if (window.top == window ||
      cvox.Interframe.id === undefined ||
      this.height == -1) {
    return;
  }

  cvox.Interframe.sendMessageToParentWindow(
      {'command': cvox.BaseModifier.IFRAME_HEIGHT,
       'height': this.height});
};

/**
 * This gets called only after we've finished making changes to the DOM.
 * Compute the new height of this page and send it to the parent, then
 * install a listener so we can reprocess the DOM if there are future
 * changes to the DOM tree.
 */
cvox.BaseModifier.prototype.finishProcessingAfterProcessDOM = function() {
  var bottomElement = document.createElement('div');
  document.body.appendChild(bottomElement);
  window.setTimeout(goog.bind(function() {
    if (bottomElement.parentElement) {
      this.height = bottomElement.offsetTop;
      document.body.removeChild(bottomElement);
    } else if (document.body.lastChild) {
      this.height = document.body.lastChild.offsetTop +
          document.body.lastChild.offsetHeight;
    } else {
      this.height = 0;
    }
    this.sendHeightToParent();
  }, this), 0);

  window.setTimeout(goog.bind(this.addSubtreeModifiedListener, this), 1000);
};

/**
 * Start listening to subtree modified events.
 */
cvox.BaseModifier.prototype.addSubtreeModifiedListener = function() {
  if (!this.subtreeModifiedListener) {
    this.subtreeModifiedListener = goog.bind(this.onSubtreeModified, this);
  }

  if (!this.listenerInstalled) {
    document.addEventListener(
        'DOMSubtreeModified',
        this.subtreeModifiedListener,
        true);
    this.listenerInstalled = true;
  }
};

/**
 * Stop listening to subtree modified events.
 */
cvox.BaseModifier.prototype.removeSubtreeModifiedListener = function() {
  if (this.listenerInstalled) {
    document.removeEventListener(
        'DOMSubtreeModified',
        this.subtreeModifiedListener,
        true);
    this.listenerInstalled = false;
  }
};

/**
 * Called when the DOM changes. Reprocess everything as needed.
 * Some delays are introduced here to avoid an endless cycle of
 * updates - we don't want to receive notifications for our own
 * changes to the DOM!
 */
cvox.BaseModifier.prototype.onSubtreeModified = function() {
  this.removeSubtreeModifiedListener();
  window.setTimeout(goog.bind(function() {
    this.reprocess();
  }, this), 100);
};
