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
 * @fileoverview Decorates a walker with filtering abilities.
 * @author dtseng@google.com (David Tseng)
 */


goog.provide('cvox.WalkerDecorator');

goog.require('cvox.ChromeVoxJSON');


/**
 * @constructor
 */
cvox.WalkerDecorator = function() {
  /**
   * @type {!Array.<string>}
   */
  this.filters = [];

  /**
   * @type {!Object.<string, !Array.<string>>}
   * @private
   */
  this.filterMap_ = {};

  /**
   * @type {boolean}
   * @private
   */
  this.isInclusive_ = false;
};

/**
 * Whether these filters are inclusive or exclusive.
 * Inclusive filtering continues walking until a filter is matched.
 * Exclusive filtering keeps walking until no filters are matched.
 * @return {boolean} true if inclusive filtering.
 */
cvox.WalkerDecorator.prototype.getIsInclusive = function() {
  return this.isInclusive_;
};

/**
 * Decorates a walker's movement with filtering.
 * @param {!cvox.AbstractWalker} walker The walker.
 */
cvox.WalkerDecorator.prototype.decorate = function(walker) {
  walker.next = this.filteredMove_(walker, walker.next);
};

/**
 * Returns a method that decorates the original method with filtering.
 * @param {!cvox.AbstractWalker} walker The walker owning movement.
 * @param {function(!cvox.CursorSelection): cvox.CursorSelection} original
 * The walker's original method.
 * @return {function(!cvox.CursorSelection): cvox.CursorSelection} Filter
 * enhanced method.
 * @private
 */
cvox.WalkerDecorator.prototype.filteredMove_ =
    function(walker, original) {
  return goog.bind(function(sel) {
    var ret = original.call(walker, sel);
    while (ret &&
           ret != sel &&
           this.matchesFilter(ret.start.node) != this.getIsInclusive()) {
      ret = original.call(walker, ret);
    }
    return ret;
  }, this);
};

/**
 * Adds a query selector to filter when walking.
 * @param {?string} filter The selector to add.
 */
cvox.WalkerDecorator.prototype.addFilter = function(filter) {
  if (filter == null) {
    return;
  }
  if (this.filters.indexOf(filter) == -1) {
    this.filters.push(filter);
    this.saveToLocalStorage();
  }
};

/**
 * Removes a query selector to filter when walking.
 * @param {?string} filter The selector to remove.
 * @return {boolean} true if the filter was removed.
 */
cvox.WalkerDecorator.prototype.removeFilter = function(filter) {
  if (filter == null) {
    return false;
  }
  var success = false;
  for (var i = 0; i < this.filters.length; ++i) {
    if (filter == this.filters[i]) {
      this.filters.splice(i, 1);
      success = true;
    }
  }
  this.saveToLocalStorage();

  return success;
};

/**
 * Matches a node against our collection of filters.
 * @param {Node} node The node to match.
 * @return {boolean} Whether the node matches any filters.
 */
cvox.WalkerDecorator.prototype.matchesFilter = function(node) {
  if (!node)
    return false;

  while (!node.tagName)
    node = node.parentNode;

  for (var i = 0; i < this.filters.length; ++i) {
    if (node.webkitMatchesSelector(this.filters[i]))
      return true;
  }
  return false;
};

/**
 * Checks for existence of a filter.
 * @param {string} filter The node to retrieve a filter for.
 * @return {boolean} Whether the selector is filtered.
 */
cvox.WalkerDecorator.prototype.hasFilter = function(filter) {
  for (var i = 0; i < this.filters.length; ++i) {
    if (filter == this.filters[i])
      return true;
  }
  return false;
};

/**
 * Saves filters to the background script's local storage context.
 */
cvox.WalkerDecorator.prototype.saveToLocalStorage = function() {
  if (this.filters.length == 0)
    return;

  this.filterMap_[window.location.href] = this.filters;

  // TODO(dtseng): Send filters for only this page.
  cvox.ChromeVox.host.sendToBackgroundPage({
      'target': 'Prefs',
      'action': 'setPref',
      'pref': 'filterMap',
      'value': cvox.ChromeVoxJSON.stringify(this.filterMap_)
  });
};

/**
 * Reinitializes filters on a new page load.
 * @param {string} filterMap JSON href to filter mapping.
 */
cvox.WalkerDecorator.prototype.reinitialize = function(filterMap) {
  this.filterMap_ = {};
  this.filters = [];

  if (filterMap) {
    try {
      this.filterMap_ = /** @type {!Object.<string, !Array.<string>>} */
          cvox.ChromeVoxJSON.parse(filterMap);
      if (window.location.href && this.filterMap_[window.location.href])
        this.filters = this.filterMap_[window.location.href];
    } catch (e) {
      window.console.error('Unable to parse filters ' + filterMap);
      this.filterMap_ = {};
      return;
    }
  }
};

/**
 * Calculates the selector corresponding to a node.
 * Preference is given towards class names. If there are multiple class names,
 * then use the most specific one.
 * As a last resort, use the id.
 * @param {Node} node The node to retrieve a filter for.
 * @return {?string} The filter for the node.
 */
cvox.WalkerDecorator.filterForNode = function(node) {
  if (!node || !cvox.DomUtil.hasContent(node)) {
    return null;
  }

  while (!node.tagName) {
    node = node.parentNode;
  }

  if (node.className) {
    var classes = node.className.trim().split(' ');
    var finalClass = '.' + classes[classes.length - 1];

    // Validation in cases where authors have badly formatted classnames.
    try {
      node.webkitMatchesSelector(finalClass);
      return finalClass;
    } catch (e) {
      // Badly formated classname; continue below.
    }
  }

  if (node.id) {
    var finalId = node.id.trim();

    // Validation in cases where authors have badly formatted id's.
    try {
      node.webkitMatchesSelector(finalId);
      return finalId;
    } catch (e) {
      // Badly formated id; continue below.
    }
  }

  return null;
};
