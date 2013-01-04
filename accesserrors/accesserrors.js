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
 * @fileoverview Accessibility errors checker.
 * @author edsun@google.com (Edward Sun)
 */


goog.provide('AccessErrors');

var ERRS = {
  'img_label': { 'type': 'error',
                 'msg': '[img] Missing label attribute (e.g. alt, title)' },

  'button_value': { 'type': 'error',
                 'msg': '[input] Button missing a value' },

  'input_label': { 'type': 'error',
                 'msg': '[input] Missing corresponding label' },

  'no_area': { 'type': 'error',
                 'msg': 'Focusable element is invisible with area = 0' },

  'no_opacity': { 'type': 'error',
                 'msg': 'Focusable element is invisible with opacity = 0' },

  'no_view': { 'type': 'error',
                 'msg': 'Focusable element is invisible - out of viewport' },

  'below_object': { 'type': 'error',
                 'msg': 'Focusable element is below another object' },

  'bad_click': { 'type': 'error',
                 'msg': 'Clickable element not <a> or button (using onEvent)' },

  'bad_click_css': { 'type': 'error',
                 'msg': 'Clickable element not <a> or button (CSS pointer)' },

  'multiple_roles': { 'type': 'error',
                 'msg': 'Multiple roles are not supported by any browser.' },

  'bad_role': { 'type': 'error',
                 'msg': 'Value for role attribute not recognized.' },

  'no_video_text': { 'type': 'error',
                 'msg': 'Textual alternatives should be provided for videos' },

  'title_and_alt': { 'type': 'warning',
                 'msg': 'One of "title" or "alt" must be set, but not both' }

};

var ARIA_ROLES = ['alert',
                  'alertdialog',
                  'application',
                  'article',
                  'banner',
                  'button',
                  'checkbox',
                  'columnheader',
                  'combobox',
                  'complementary',
                  'contentinfo',
                  'definition',
                  'dialog',
                  'directory',
                  'document',
                  'form',
                  'grid',
                  'gridcell',
                  'group',
                  'heading',
                  'img',
                  'link',
                  'list',
                  'listbox',
                  'log',
                  'main',
                  'marquee',
                  'math',
                  'menu',
                  'menubar',
                  'menuitem',
                  'menuitemcheckbox',
                  'menuitemradio',
                  'navigation',
                  'note',
                  'option',
                  'presentation',
                  'progressbar',
                  'radio',
                  'radiogroup',
                  'region',
                  'row',
                  'rowgroup',
                  'rowheader',
                  'scrollbar',
                  'search',
                  'separator',
                  'slider',
                  'spinbutton',
                  'status',
                  'tab',
                  'tablist',
                  'tabpanel',
                  'textbox',
                  'timer',
                  'toolbar',
                  'tooltip',
                  'tree',
                  'treegrid',
                  'treeitem'];

function hostNameExceptions(url) {
  var exceptions = ['google.com/analytics',
                    'google.com/calendar',
                    'google.com/imghp',
                    'google.com/moderator',
                    'google.com/contacts',
                    'google.com/finance',
                    'google.com/voice',
                    'google.com/cloudprint',
                    'google.com/offers',
                    'google.com/shopping'];

  for (var i = 0; i < exceptions.length; i++) {
    if (url.toLowerCase().indexOf(exceptions[i]) >= 0) {
      return exceptions[i];
    }
  }

  return false;
}

/** Generates an error object from a given DOM object, error code, and optional
 * error message.
 * @param {Element} dom_object The offending DOM object.
 * @param {string} code The error code (see ERR_MSG array at the top).
 * @param {string} opt_msg Overriding error message (default in ERR_MSG).
 * @param {string} opt_type Overriding error type (default in ERR_TYPE).
 * @return {Object} An object describing the error.
 */
function generateError(dom_object, code, opt_msg, opt_type) {
  var error_obj = new Object();
  error_obj.err_code = code;
  error_obj.url = location.protocol +
                  '//' +
                  location.host +
                  location.pathname +
                  (location.search ? '?...' : '');
  error_obj.hostname = hostNameExceptions(document.URL) ?
                       hostNameExceptions(document.URL) :
                       window.location.hostname;
  error_obj.timestamp = new Date();
  error_obj.tag_name = dom_object.tagName;
  error_obj.readable_path = getReadablePath(dom_object);
  error_obj.query_selector_text = getQuerySelectorText(dom_object);

  if (dom_object.tagName) {
    error_obj.outer_html = censorHTML(dom_object);
  } else {
    error_obj.outer_html = 'N/A';
  }
  error_obj.msg = (!!opt_msg ? opt_msg : ERRS[code]['msg']);
  error_obj.err_type = (!!opt_type ? opt_type : ERRS[code]['type']);
  return error_obj;
}

/** Produces an outerHTML snapshot and censors out potentially-confidential info
 * @param {Element} dom_object The DOM object.
 * @return {string} A censored outerHTML snapshot.
 */
function censorHTML(dom_object) {

  if (dom_object == null || dom_object.tagName == null) {
    return '';
  }

  var outer_html = '<' + dom_object.tagName.toLowerCase();
  var attributes = dom_object.attributes;

  // Censor all attribute values except id and class
  for (var i = 0; i < attributes.length; i++) {
    if (attributes.item(i).nodeName.toLowerCase() == 'id' ||
       attributes.item(i).nodeName.toLowerCase() == 'class') {
      outer_html += ' ' +
                    attributes.item(i).nodeName +
                    '="' +
                    attributes.item(i).nodeValue +
                    '"';
    } else {
      outer_html += ' ' + attributes.item(i).nodeName + '="..."';
    }
  }

  outer_html += '>';

  if (dom_object.innerHTML) {
    var children = dom_object.childNodes;
    if (children) {
      var inner_text = '';

      for (var i = 0; i < children.length; i++) {
        inner_text += '' + censorHTML(children[i]);
      }
      outer_html += inner_text;
    }

    outer_html += '</' + dom_object.tagName.toLowerCase() + '>';

    return outer_html;
  }

  return outer_html;
}

/** Gets a human-readable path to a DOM object on the page.
 * @param {Node} obj The DOM object.
 * @return {string} Human-readable unique path to the DOM object.
 */
function getReadablePath(obj) {
  // If CSS Object, just return the selector text.
  if (obj.selectorText) {
    return obj.selectorText;
  }

  if (obj == null || obj.tagName == 'HTML') {
    return 'document';
  } else if (obj.tagName == 'BODY') {
    return 'document.body';
  }

  if (obj.hasAttribute) {
    if (obj.hasAttribute('id')) {
      return 'document.getElementById(\'' + obj.id + '\')';
    }

    if (obj.className) {
      if (obj.parentNode) {
        var similarClass = obj.parentNode.getElementsByClassName(obj.className);
        var i = 0;
        while (similarClass[i] !== obj) {
          i++;
        }
      }
      return getReadablePath(obj.parentNode) + '.' +
             'getElementsByClassName(\'' + obj.className + '\')[' + i + ']';
    }

    if (obj.parentNode) {
      var similarTags = obj.parentNode.getElementsByTagName(obj.tagName);
      var i = 0;
      while (similarTags[i] !== obj) {
        i++;
      }
    }
    return getReadablePath(obj.parentNode) + '.' +
           'getElementsByTagName(\'' + obj.tagName + '\')[' + i + ']';
  }
  return '';
}

/** Gets a CSS selector text for a DOM object.
 * @param {Node} obj The DOM object.
 * @return {string} CSS selector text for the DOM object.
 */
function getQuerySelectorText(obj) {
  if (obj == null || obj.tagName == 'HTML') {
    return 'html';
  } else if (obj.tagName == 'BODY') {
    return 'body';
  }

  if (obj.hasAttribute) {

    if (obj.id) {
      return '#' + obj.id;
    }

    if (obj.className) {
      var selector = '';
      for (var i = 0; i < obj.classList.length; i++)
        selector += '.' + obj.classList[i];

      var total = 0;
      if (obj.parentNode) {
        for (i = 0; i < obj.parentNode.children.length; i++) {
          var similar = obj.parentNode.children[i];
          if (similar.webkitMatchesSelector(selector))
            total++;
          if (similar === obj)
            break;
        }
      } else {
        total = 1;
      }

      if (total == 1) {
        return getQuerySelectorText(obj.parentNode) +
               ' > ' + selector;
      } else {
        return getQuerySelectorText(obj.parentNode) +
               ' > ' + selector + ':nth-of-type(' + total + ')';
      }
    }

    if (obj.parentNode) {
      var similarTags = obj.parentNode.children;
      var total = 1;
      var i = 0;
      while (similarTags[i] !== obj) {
        if (similarTags[i].tagName == obj.tagName) {
          total++;
        }
        i++;
      }

      var next = '';
      if (obj.parentNode.tagName != 'BODY') {
        next = getQuerySelectorText(obj.parentNode) +
               ' > ';
      }

      if (total == 1) {
        return next +
               obj.tagName;
      } else {
        return next +
               obj.tagName +
               ':nth-of-type(' + total + ')';
      }
    }

  } else if (obj.selectorText) {
    return obj.selectorText;
  }

  return '';
}

/** Points a readable path (generated from getReadablePath) to the
 * corresponding DOM object.
 * @param {string} rpath Readable path (generated from getReadablePath).
 * @return {Element} The corresponding DOM Object.
 */

function getDOMFromPath(rpath) {
  // TODO(edsun): This is scary code, please document why it is safe.
  return /** @type {Element} */ (eval(rpath));
}


/** Recurse node1 to root and perform boolean binary operation op on node1 and
 * node2.
 * @param {Object} node1 Node to be recursed.
 * @param {Object} node2 Node to be compared g4 to.
 * @param {Function} op Binary fn applied on node1 and node2, in that order.
 * @return {boolean} If op performed is ever true, then return true. false OW.
 */
function compareNodes(node1, node2, op) {
  if (node1 == null || node1.tagName == 'BODY') {
    return false;
  }
  if (op(node1, node2)) {
    return true;
  }

  return compareNodes(node1.parentNode, node2, op);
}

/** Selects all focusable elements on the page.
 * Focusable defined as: all <input> <select> <textarea> <button> <a> <iframe>
 * and other tags that have the tabIndex attribute set.
 * @return {NodeList} a NodeList of focusable DOM objects.
 */
function getFocusableElements() {
  var selector = 'input:not([type="hidden"]),';
  selector += 'select,';
  selector += 'textarea,';
  selector += 'button,';
  selector += 'a[href],';
  selector += 'iframe,';
  selector += '[tabIndex]';
  var all = document.querySelectorAll(selector);

  return all;
}


/** Checks to see if any children in a node is visible.
 * and other tags that have the tabIndex attribute set.
 * @param {Node} dom_object The DOM object.
 * @return {boolean} True if any visible, False is all invisible.
 */
function checkChildrenVisible(dom_object) {
  if (!(dom_object instanceof HTMLElement)) {
    return false;
  }

  if (dom_object.hasChildNodes()) {
    var ret = false;
    var i = 0;
    while (ret == false && i < dom_object.childNodes.length) {
      if (checkChildrenVisible(dom_object.childNodes[i])) {
        ret = true;
      }
      i++;
    }
    return ret;
  }

  var rects = dom_object.getBoundingClientRect();
  var obj_width = rects.right - rects.left;
  var obj_height = rects.top - rects.bottom;

  if (obj_width == 0 || obj_height == 0) {
    return false;
  } else {
    return true;
  }
}

/**
 * @param {Element} obj An element to check.
 * @return {boolean} True if the element is hidden from accessibility.
 */
function isElementHidden(obj) {
  if (!(obj instanceof HTMLElement))
    return false;

  var style = window.getComputedStyle(obj, null);
  if (style.display == 'none' || style.visibility == 'hidden')
    return true;

  if (obj.getAttribute('aria-hidden') == 'true')
    return true;

  return false;
}

/**
 * @param {Element} obj An element to check.
 * @return {boolean} True if the element or one of its ancestors is
 *     hidden from accessibility.
 */
function isElementOrAncestorHidden(obj) {
  if (isElementHidden(obj))
    return true;

  if (obj.parentElement) {
    return isElementOrAncestorHidden(obj.parentElement);
  } else {
    return false;
  }
}

/** Checks to see if dom_object is visible
 * (Area is greater than 0, obj is in the viewport, and not below another obj)
 * @param {Element} dom_object The object to check.
 * @return {string} 'true' if visible, error code if not.
 */
function isVisible(dom_object) {
  // If this node is a child of a DOM object that is display:none, tabIndex < 0,
  // or visibility:hidden, then this node will pass this check (it's fine)
  var canSafelyIgnore = function(obj1, obj2) {
    if (isElementHidden(obj1) || obj1.tabIndex < 0) {
      return true;
    }
    return false;
  };

  if (compareNodes(dom_object, dom_object, canSafelyIgnore)) {
    return 'true';
  }

  var rects = dom_object.getBoundingClientRect();
  var obj_width = rects.right - rects.left;
  var obj_height = rects.top - rects.bottom;
  var scroll_height = document.documentElement.scrollHeight;
  var scroll_width = document.documentElement.scrollWidth;
  var scroll_top = document.body.scrollTop;
  var scroll_left = document.body.scrollLeft;

  var children_visible = checkChildrenVisible(dom_object);

  // Object is invisible (has an area of 0), return false
  if (!children_visible &&
      (obj_width == 0 || obj_height == 0)) {
    return 'no_area';
  }

  // Object has opacity:0
  if (!children_visible &&
       dom_object.style.opacity == '0') {
    return 'no_opacity';
  }

  // Object is not in the viewport, return false
  if (rects.top > scroll_height || rects.bottom < 0 - scroll_top ||
    rects.left > scroll_width || rects.right < 0 - scroll_left) {

    return 'no_view';
  }

  // Object is below another object (checks the center coordinate)
  if (window.getComputedStyle(dom_object, '').display == 'inline-block' ||
      window.getComputedStyle(dom_object, '').display == 'block') {
    var center_x = (rects.left + rects.right) / 2;
    var center_y = (rects.top + rects.bottom) / 2;
    var elem_at_point = document.elementFromPoint(center_x, center_y);
    var triple_equals = function(a, b) { return a === b; };

    if (elem_at_point !== null &&
        elem_at_point !== dom_object &&
        !compareNodes(elem_at_point, dom_object, triple_equals)) {
      return 'below_object';
    }
  }
  return 'true';
}


/** AccessErrors Constructor
 * AccessErrors class holds the current errors on the page and
 * provides methods to retrive/send/analyze these errors.
 * @constructor
 */
AccessErrors = function() {
  this.errors = new Array();
};


/** Gets the current errors array
 * @return {Array} The errors array.
 */
AccessErrors.prototype.getErrors = function() {
  return this.errors;
};


/** Highlights accessibility errors directly on the web page using a border
 * @param {string} err_code Show only certain error codes, or all if null.
 */
AccessErrors.prototype.showErrors = function(err_code) {
  for (var i = 0; i < this.errors.length; i++) {
    if (err_code == null || err_code == this.errors[i].err_code) {
      try {
        var dom_object = document.querySelector(
                           this.errors[i].query_selector_text);

        dom_object.style.border = '3px solid #ff0000';
        dom_object.title = this.errors[i].msg +
                             ' at ' +
                             this.errors[i].query_selector_text;
      } catch (e) {
        console.log('Error not displayed on screen: (' + e + ')');
        console.log(this.errors[i]);
        try {

          console.log('Trying getDOMFromPath: ');
          var dom_object = getDOMFromPath(
                           this.errors[i].readable_path);

          dom_object.style.border = '3px solid #ff0000';
          dom_object.title = this.errors[i].msg +
                               ' at ' +
                               this.errors[i].query_selector_text +
                               '\n\nID: ' +
                               this.errors[i].id;
          console.log('getDOMFromPath passed.');
        } catch (f) {
          console.log('getDOMFromPath also failed (' + f + ')');
        }
      }
    }
  }
};


/** Detect images with missing ALT text
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkImg = function() {

  var noerrors = true;
  var img_tags = document.getElementsByTagName('img');

  for (var i = 0; i < img_tags.length; i++) {
    if (isElementOrAncestorHidden(img_tags[i])) {
      continue;
    }

    if (img_tags[i].hasAttribute('alt') == false &&
        img_tags[i].hasAttribute('title') == false &&
        img_tags[i].hasAttribute('aria-label') == false &&
        img_tags[i].hasAttribute('aria-labelledby') == false &&
        img_tags[i].hasAttribute('placeholder') == false) {
      this.errors.push(generateError(img_tags[i],
                                     'img_label'));
      noerrors = false;
    }
  }

  return noerrors;
};


/** Detect unlabeled form controls
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkInput = function() {

    var noerrors = true;

    // Fetch the input tags on the page and see if they have associated labels
    var input_tags = document.getElementsByTagName('input');
    for (var i = 0; i < input_tags.length; i++) {
      if (isElementOrAncestorHidden(input_tags[i])) {
        continue;
      }

      if (input_tags[i].type.toLowerCase() != 'hidden' &&
          input_tags[i].style.display != 'none' &&
          input_tags[i].style.visibility != 'hidden') {
        if (input_tags[i].type.toLowerCase() == 'submit' ||
           input_tags[i].type.toLowerCase() == 'button') {
          if (input_tags[i].value == null) {
            this.errors.push(generateError(input_tags[i],
                                           'button_value'));
            noerrors = false;
          }
        } else if (input_tags[i].hasAttribute('aria-labelledby')) {
          if (input_tags[i].getAttribute('aria-labelledby').indexOf(' ') < 0) {
            var all_labels = new Array(
                               input_tags[i].getAttribute('aria-labelledby'));
          } else {
            var all_labels =
                       input_tags[i].getAttribute('aria-labelledby').split(' ');
          }
          for (var k = 0; k < all_labels.length; k++) {
            if (document.getElementById(all_labels[k]) == null) {
              this.errors.push(generateError(input_tags[i],
                                             'input_label'));
              noerrors = false;
            }
          }
        } else if (document.querySelector(
            'label[for="' + input_tags[i].id + '"]') === null &&
            input_tags[i].hasAttribute('title') == false &&
            input_tags[i].hasAttribute('aria-label') == false &&
            input_tags[i].hasAttribute('placeholder') == false) {
          this.errors.push(generateError(input_tags[i],
                                         'input_label'));
          noerrors = false;
        }
      }
    }

    return noerrors;
};

/** Identical to String.indexOf, but for a NodeList
 * @param {NodeList} node_list A list of elements.
 * @param {Element} obj The element to look for.
 * @return {number} obj The position of the Object in a NodeList. -1 if not found.
 */
function NodeListIndexOf(node_list, obj) {
  if(node_list.length > 0) {
    for (var i = 0; i < node_list.length; i++) {
      if (node_list[i] === obj) {
        return i;
      }
    }
  }

  return -1;
}

/** Detect focusable but not visible elements
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkFocusable = function() {

  var noerrors = true;
  var focus_elements = getFocusableElements();

  for (var i = 0; i < focus_elements.length; i++) {
    if (isElementOrAncestorHidden(focus_elements[i])) {
      continue;
    }

    var visibility = isVisible(focus_elements[i]);
    if (visibility != 'true') {
      this.errors.push(generateError(focus_elements[i],
                                     visibility));
      noerrors = false;
    }
  }

  return noerrors;
};


/** Detect items that appear to be clickable but are not a/input tags
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkClickable = function() {
  var noerrors = true;
  var events = '[onclick], [onmousedown], [onselect]';
  var event_elements = document.querySelectorAll(events);

  // Check elements for explicit onclick handlers that are not buttons or <a>
  if (event_elements != null) {
    for (var i = 0; i < event_elements.length; i++) {
      if (isElementOrAncestorHidden(event_elements[i])) {
        continue;
      }

      if (event_elements[i].tagName != 'INPUT' &&
          event_elements[i].tagName != 'A' &&
          event_elements[i].tagName != 'BUTTON') {
        this.errors.push(generateError(event_elements[i],
                                       'bad_click'));
        noerrors = false;
      }
    }
  }
  // Check stylesheets to see if there are any cursors upon hovering over
  // an element that suggest click functionalities on non-clickable elements
  if (document.styleSheets != null) {
    for (var i = 0; i < document.styleSheets.length; i++) {
      var styleSheet = document.styleSheets[i];
      if (styleSheet.cssRules != null)
      for (var j = 0; j < styleSheet.cssRules.length; j++) {
        var rule = styleSheet.cssRules[j];
        if (rule.selectorText != undefined &&
           rule.selectorText.toLowerCase().indexOf(':hover') >= 0 &&
           rule.selectorText.toLowerCase().indexOf('a:hover') < 0 &&
           rule.selectorText.toLowerCase().indexOf('input:hover') < 0 &&
           rule.selectorText.toLowerCase().indexOf('button:hover') < 0) {

          if (rule.style.cursor == 'pointer' ||
           rule.style.cursor == 'crosshair' ||
           rule.style.cursor == 'hand' ||
           rule.style.cursor == 'move' ||
           rule.style.cursor == 'all-scroll' ||
           rule.style.cursor.indexOf('resize') >= 0) {

            var query_text = rule.selectorText.toLowerCase().replace(':hover',
                                                                     '');
            var selected_obj = document.querySelector(query_text);
            if (selected_obj &&
                NodeListIndexOf(getFocusableElements(), selected_obj) < 0 &&
                selected_obj.tabIndex < 0 &&
                !isElementOrAncestorHidden(selected_obj)) {
              this.errors.push(generateError(selected_obj,
                                             'bad_click_css'));
              noerrors = false;
            }
          }
        }
      }
    }
  }
  return noerrors;
};

/** Checks for valid uses of the ARIA standard.
 *    - valid use of the 'role' attribute
 *    - dependencies for certain attributes
 *    - correct values are used for certain attributes
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkARIA = function() {
  var noerrors = true;
  var roles = document.querySelectorAll('[role]');

  for (var i = 0; i < roles.length; i++) {
    if (isElementOrAncestorHidden(roles[i])) {
      continue;
    }

    if (ARIA_ROLES.indexOf(roles[i].getAttribute('role')) < 0) {
      if (roles[i].getAttribute('role').indexOf(' ') >= 0) {
        this.errors.push(generateError(roles[i],
                                       'multiple_roles'));
      } else {
        this.errors.push(generateError(roles[i],
                                       'bad_role'));
      }
      noerrors = false;
    }
  }

  return noerrors;
};

function trim(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/** Checks for alternative text in video tags
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkVideoText = function() {
  var noerrors = true;
  var videos = document.querySelectorAll('video');

  for (var i = 0; i < videos.length; i++) {
    if (isElementOrAncestorHidden(videos[i])) {
      continue;
    }

    // Note: The textContent property may not work on other browsers.
    if (trim(videos[i].textContent) == '') {
      this.errors.push(generateError(videos[i],
                                     'no_video_text'));
      noerrors = false;
    }
  }

  return noerrors;
};

/** Checks for elements with both "title" AND "alt" attributes.
 * @return {boolean} Whether a warning occured.
 */
AccessErrors.prototype.checkImgAndAlt = function() {
  var noerrors = true;
  var elements = document.querySelectorAll('[alt][title]');

  for (var i = 0; i < elements.length; i++) {
    if (isElementOrAncestorHidden(elements[i])) {
      continue;
    }

    this.errors.push(generateError(elements[i],
                                   'title_and_alt'));
    noerrors = false;
  }

  return noerrors;
};

/** Run all tests.
 * @return {boolean} Whether an error occured.
 */
AccessErrors.prototype.checkAll = function() {
  var result = true;

  // Always run all tests, even if one fails right away.
  result = this.checkImg() && result;
  result = this.checkInput() && result;
  result = this.checkFocusable() && result;
  result = this.checkClickable() && result;
  result = this.checkARIA() && result;
  result = this.checkVideoText() && result;
  result = this.checkImgAndAlt() && result;

  return result;
};

