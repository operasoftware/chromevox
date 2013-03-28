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
 * @fileoverview An object that represents a dimension in cvox.CssSpace.
 * @author dtseng@google.com (David Tseng)
 */
goog.provide('cvox.CssDimension');

/**
 * @typedef {Object}
 */
cvox.CssDimension = {
  /**
   * Name of the dimension.
   * @type {?string} */
  name: null,

  /**
   * Distance when nodes are no longer related.
   * @type {?number} */
  threshold: null,

  /**
   * The name of the function that provides distance.
   * @type {?function(!Node, !Node): number}
   */
  distance: null
};
