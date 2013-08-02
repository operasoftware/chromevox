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
 * @fileoverview Speech rules for math nodes.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathNodeRules');

goog.require('cvox.MathNode');


/**
 * Rule initialization.
 * @constructor
 */
cvox.MathNodeRules = function() {
  cvox.MathNodeRules.initDefaultRules(); // MathML rules.
  cvox.MathNodeRules.initMathjaxRules(); // MathJax Rules
  cvox.MathNodeRules.initAliases(); // MathJax Aliases for MathML rules.
  cvox.MathNodeRules.initSpecializationRules(); // Square, cube, etc.
};
goog.addSingletonGetter(cvox.MathNodeRules);

/**
 * @type {cvox.MathNode}
 */
cvox.MathNodeRules.mathNode = cvox.MathNode.getInstance();

// These are used to work around around Closure's rules for aliasing.
/** @private */
cvox.MathNodeRules.defineDefaultMathmlRule_ = goog.bind(
    cvox.MathNodeRules.mathNode.defineDefaultMathmlRule,
    cvox.MathNodeRules.mathNode);
/** @private */
cvox.MathNodeRules.defineRule_ = goog.bind(
    cvox.MathNodeRules.mathNode.defineRule,
    cvox.MathNodeRules.mathNode);
/** @private */
cvox.MathNodeRules.defineRuleAlias_ = goog.bind(
    cvox.MathNodeRules.mathNode.defineRuleAlias,
    cvox.MathNodeRules.mathNode);

goog.scope(function() {
var defineDefaultMathmlRule = cvox.MathNodeRules.defineDefaultMathmlRule_;
var defineRule = cvox.MathNodeRules.defineRule_;
var defineRuleAlias = cvox.MathNodeRules.defineRuleAlias_;

/**
 * Initialize the default mathrules.
 */
cvox.MathNodeRules.initDefaultRules = function() {
  // Initial rule
  defineDefaultMathmlRule('math', '[m] ./*');

  // Space elements
  defineDefaultMathmlRule('mspace', '[p] (pause:250)');
  defineDefaultMathmlRule('mstyle', '[m] ./*');
  defineDefaultMathmlRule('mpadded', '[m] ./*');
  defineDefaultMathmlRule('merror', '[m] ./*');
  defineDefaultMathmlRule('mphantom', '[m] ./*');

  // Token elements.
  defineDefaultMathmlRule('mtext', '[t] text(); [p] (pause:200)');
  defineDefaultMathmlRule('mi', '[n] text()');
  defineDefaultMathmlRule('mo', '[n] text() (rate:-0.1)');
  defineDefaultMathmlRule('mn', '[n] text()');

  // Dealing with fonts.
  defineRule('mtext-variant', 'MathML', 'default.default',
      '[t] "begin"; [t] @mathvariant (pause:150);' +
          '[t] text() (pause:150); [t] "end"; ' +
          '[t] @mathvariant (pause:200)',
      'self::mathml:mtext', '@mathvariant', '@mathvariant!="normal"');

  defineRule('mi-variant', 'MathML', 'default.default',
      '[t] @mathvariant; [n] text()',
      'self::mathml:mi', '@mathvariant', '@mathvariant!="normal"');

  defineRuleAlias('mi-variant', 'self::mathml:mn',  // mn
      '@mathvariant', '@mathvariant!="normal"');

  defineRule('mo-variant', 'MathML', 'default.default',
      '[t] @mathvariant; [n] text() (rate:-0.1)',
      'self::mathml:mo', '@mathvariant', '@mathvariant!="normal"');

  defineDefaultMathmlRule(
      'ms',
      '[t] "string" (pitch:0.5, rate:0.5); [t] text()');

  // Script elements.
  defineDefaultMathmlRule(
      'msup', '[n] ./*[1]; [t] "super";' +
          '[n] ./*[2] (pitch:0.35); [p] (pause:300)');
  defineDefaultMathmlRule(
      'msubsup',
      '[n] ./*[1]; [t] "sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:200);' +
          '[t] "super"; [n] ./*[3] (pitch:0.35); [p] (pause:300)'
      );
  defineDefaultMathmlRule(
      'msub',
      '[n] ./*[1]; [t] "sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:300)');
  defineDefaultMathmlRule(
      'mover', '[n] ./*[2] (pitch:0.35); [p] (pause:200);' +
          ' [t] "over"; [n] ./*[1]; [p] (pause:400)');
  defineDefaultMathmlRule(
      'munder',
      '[n] ./*[2] (pitch:-0.35); [t] "under"; [n] ./*[1]; [p] (pause:400)');
  defineDefaultMathmlRule(
      'munderover',
      '[n] ./*[2] (pitch:-0.35); [t] "under and"; [n] ./*[3] (pitch:0.35);' +
          ' [t] "over"; [n] ./*[1]; [p] (pause:400)');

  // Layout elements.
  defineDefaultMathmlRule('mrow', '[m] ./*');
  defineDefaultMathmlRule(
      'msqrt', '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)');
  defineDefaultMathmlRule(
      'mroot', '[t] "root of order"; [n] ./*[2]; [t] "of";' +
          '[n] ./*[1] (rate:0.2); [p] (pause:400)');
  defineDefaultMathmlRule(
      'mfrac', ' [p] (pause:400); [n] ./*[1] (pitch:0.3);' +
          ' [t] "divided by"; [n] ./*[2] (pitch:-0.3); [p] (pause:400)');


  defineRule(
      'mfenced-single', 'MathML', 'default.default',
      '[t] @open (context:"opening"); [m] ./* (separator:@separators);' +
          '[t] @close (context:"closing")',
      'self::mathml:mfenced', 'string-length(string(@separators))=1');

  defineRule(
      'mfenced-empty', 'MathML', 'default.default',
      '[t] @open (context:"opening"); [m] ./*;' +
          '[t] @close (context:"closing")',
      'self::mathml:mfenced', 'string-length(string(@separators))=1',
      'string(@separators)=" "');

  defineRule(
      'mfenced-comma', 'MathML', 'default.default',
      '[t] @open (context:"opening"); [m] ./* (separator:"comma");' +
          '[t] @close (context:"closing")',
      'self::mathml:mfenced');

  defineRule(
      'mfenced-multi', 'MathML', 'default.default',
      '[t] @open (context:"opening"); [m] ./* (ctxtfunc:mfSeparators);' +
          '[t] @close (context:"closing")',
      'self::mathml:mfenced', '@separators');

  // Mtable rules.
  defineRule(
      'mtable', 'MathML', 'default.default',
      '[t] "matrix"; [m] ./* (ctxtfunc:nodeCounter,context:"row",pause:100)',
      'self::mathml:mtable');

  defineRule(
      'mtr', 'MathML', 'default.default',
      '[m] ./* (ctxtfunc:nodeCounter,context:"column",pause:100)',
      'self::mathml:mtr');

  defineRule(
      'mtd', 'MathML', 'default.default',
      '[m] ./*', 'self::mathml:mtd');

  // Mtable superbrief rules.
  defineRule(
      'mtable', 'MathML', 'default.superbrief',
      '[t] count(child::mathml:mtr);  [t] "by";' +
          '[t] count(child::mathml:mtr[1]/mathml:mtd); [t] "matrix";',
      'self::mathml:mtable');

  // Mtable short rules.
  defineRule(
      'mtable', 'MathML', 'default.short',
      '[t] "matrix"; [m] ./*',
      'self::mathml:mtable');

  defineRule(
      'mtr', 'MathML', 'default.short',
      '[m] ./*', 'self::mathml:mtr');

  defineRule(
      'mtd', 'MathML', 'default.short',
      '[t] "Element"; [t] count(./preceding-sibling::mathml:mtd)+1;' +
          '[t] count(./parent::mathml:mtr/preceding-sibling::mathml:mtr)+1;' +
              '[p] (pause:500); [m] ./*',
      'self::mathml:mtd');

  // Mmultiscripts rules.
  defineRule(
      'mmultiscripts-4', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:200);' +
      '[t] "right sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:200);' +
      '[t] "right super"; [n] ./*[3] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts');
  defineRule(
      'mmultiscripts-3-1', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:200);' +
      '[t] "right super"; [n] ./*[3] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts', './mathml:none=./*[2]',
      './mathml:mprescripts=./*[4]');
  defineRule(
      'mmultiscripts-3-2', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:200);' +
      '[t] "right sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:200);',
      'self::mathml:mmultiscripts', './mathml:none=./*[3]',
      './mathml:mprescripts=./*[4]');
  defineRule(
      'mmultiscripts-3-3', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:200);' +
      '[t] "right sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:200);' +
      '[t] "right super"; [n] ./*[3] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts', './mathml:none=./*[5]',
      './mathml:mprescripts=./*[4]');
  defineRule(
      'mmultiscripts-3-4', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);' +
      '[t] "right sub"; [n] ./*[2] (pitch:-0.35); [p] (pause:200);' +
      '[t] "right super"; [n] ./*[3] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts', './mathml:none=./*[6]',
      './mathml:mprescripts=./*[4]');
  defineRule(
      'mmultiscripts-2-1', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts', './mathml:none=./*[2]',
      './mathml:none=./*[3]', './mathml:mprescripts=./*[4]');
  defineRule(
      'mmultiscripts-1-1', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left super"; [n] ./*[6] (pitch:0.35); [p] (pause:300);',
      'self::mathml:mmultiscripts', './mathml:none=./*[2]',
      './mathml:none=./*[3]', './mathml:mprescripts=./*[4]',
      './mathml:none=./*[5]');
  defineRule(
      'mmultiscripts-1-2', 'MathML', 'default.default',
      '[n] ./*[1]; [p] (pause:200);' +
      '[t] "left sub"; [n] ./*[5] (pitch:-0.35); [p] (pause:200);',
      'self::mathml:mmultiscripts', './mathml:none=./*[2]',
      './mathml:none=./*[3]', './mathml:mprescripts=./*[4]',
      './mathml:none=./*[6]');
};


/**
 * Initialize mathJax Rules
 */
cvox.MathNodeRules.initMathjaxRules = function() {
  // Initial rule
  defineRule('mj-math', 'Mathjax', 'default.default',
             '[n] ./*[1]/*[1]/*[1]', 'self::span[@class="math"]');

  // Token Elements
  defineRule(
      'mj-leaf', 'Mathjax', 'default.default',
      '[n] lookupleaf', 'self::span[@class="mi"]');
  defineRuleAlias('mj-leaf', 'self::span[@class="mo"]');
  defineRuleAlias('mj-leaf', 'self::span[@class="mn"]');
  defineRuleAlias('mj-leaf', 'self::span[@class="mtext"]');
  defineRule(
      'mj-mo-ext', 'Mathjax', 'default.default',
      '[n] extender', 'self::span[@class="mo"]',
      './*[1]/*[1]/text()', './*[1]/*[2]/text()');
  defineRule(
      'mj-texatom', 'Mathjax', 'default.default',
      '[n] ./*[1]', 'self::span[@class="texatom"]');

  // Script elements.
  defineRule(
      'mj-msubsup', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35);' +
      '[p] (pause:200); [t] "super"; [n] ./*[1]/*[2]/*[1] (pitch:0.35);' +
      '[p] (pause:300)',
      'self::span[@class="msubsup"]');
  defineRule(
      'mj-msub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "sub";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:-0.35); [p] (pause:300)',
      'self::span[@class="msub"]');
  defineRule(
      'mj-msup', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "super";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]');
  defineRule(
      'mj-munderover', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [t] "under and";' +
          '[n] ./*[1]/*[3]/*[1] (pitch:-0.35); [t] "over";' +
              '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="munderover"]');
  defineRule(
      'mj-munder', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [t] "under";' +
          '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="munder"]');
  defineRule(
      'mj-mover', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[2]/*[1] (pitch:0.35); [t] "over";' +
          '[n] ./*[1]/*[1]/*[1]; [p] (pause:400)',
      'self::span[@class="mover"]');


  // Layout elements.
  defineRule(
      'mj-mfrac', 'Mathjax', 'default.default',
      '[p] (pause:250); [n] ./*[1]/*[1]/*[1] (rate:0.2); [p] (pause:250);' +
          ' [t] "divided by"; [n] ./*[1]/*[2]/*[1] (rate:0.2);' +
              '[p] (pause:400)',
      'self::span[@class="mfrac"]');
  defineRule(
      'mj-msqrt', 'Mathjax', 'default.default',
      '[t] "Square root of";' +
          '[n] ./*[1]/*[1]/*[1] (rate:0.2); [p] (pause:400)',
      'self::span[@class="msqrt"]');
  defineRule(
      'mj-mroot', 'Mathjax', 'default.default',
      '[t] "root of order"; [n] ./*[1]/*[4]/*[1]; [t] "of";' +
          '[n] ./*[1]/*[1]/*[1] (rate:0.2); [p] (pause:400)',
      'self::span[@class="mroot"]');

  defineRule(
      'mj-mfenced', 'Mathjax', 'default.default',
      '[t] "opening"; [n] ./*[1]; ' +
          '[m] ./*[position()>1 and position()<last()];' +
              ' [t] "closing"; [n] ./*[last()]',
      'self::span[@class="mfenced"]');

  // Mtable short rules.
  defineRuleAlias('mj-leaf', 'self::span[@class="mtable"]');
  // Mmultiscripts rules.
  defineRuleAlias('mj-leaf', 'self::span[@class="mmultiscripts"]');
};


/**
 * Initialize mathJax Aliases
 */
cvox.MathNodeRules.initAliases = function() {
  // Space elements
  defineRuleAlias('mspace', 'self::span[@class="mspace"]');
  defineRuleAlias('mstyle', 'self::span[@class="mstyle"]');
  defineRuleAlias('mpadded', 'self::span[@class="mpadded"]');
  defineRuleAlias('merror', 'self::span[@class="merror"]');
  defineRuleAlias('mphantom', 'self::span[@class="mphantom"]');

  // Token elements.
  defineRuleAlias('ms', 'self::span[@class="ms"]');

  // Layout elements.
  defineRuleAlias('mrow', 'self::span[@class="mrow"]');

  // The following rules fix bugs in MathJax's LaTeX translation.
  defineRuleAlias(
      'mj-msub', 'self::span[@class="msubsup"]', 'mathmlmsub');

  defineRuleAlias(
      'mj-msup', 'self::span[@class="msubsup"]', 'mathmlmsup');

  defineRuleAlias(
      'mj-munder', 'self::span[@class="munderover"]', 'mathmlmunder');

  defineRuleAlias(
      'mj-mover', 'self::span[@class="munderover"]', 'mathmlmover');
};


/**
 * Initialize specializations wrt. content of nodes.
 */
cvox.MathNodeRules.initSpecializationRules = function() {
  // Some special nodes for square and cube.
  // MathML
  defineRule(
      'square', 'MathML', 'default.default',
      '[n] ./*[1]; [t] "square" (pitch:0.35); [p] (pause:300)',
      'self::mathml:msup', './*[2][text()=2]');
  defineRuleAlias(
      'square', 'self::mathml:msup',
      './mathml:mrow=./*[2]', 'count(./*[2]/*)=1', './*[2]/*[1][text()=2]');

  defineRule(
      'cube', 'MathML', 'default.default',
      '[n] ./*[1]; [t] "cube" (pitch:0.35); [p] (pause:300)',
      'self::mathml:msup', './*[2][text()=3]');
  defineRuleAlias(
      'cube', 'self::mathml:msup',
      './mathml:mrow=./*[2]', 'count(./*[2]/*)=1', './*[2]/*[1][text()=3]');

  defineRule(
      'square-sub', 'MathML', 'default.default',
      '[n] ./*[1]; [t] "sub"; [n] ./*[2] (pitch:-0.35);' +
          '[p] (pause:300); [t] "square" (pitch:0.35); [p] (pause:400)',
      'self::mathml:msubsup', './*[3][text()=2]');
  defineRuleAlias(
      'square-sub', 'self::mathml:msubsup',
      './mathml:mrow=./*[3]', 'count(./*[3]/*)=1', './*[3]/*[1][text()=2]');

  defineRule(
      'cube-sub', 'MathML', 'default.default',
      '[n] ./*[1]; [t] "sub"; [n] ./*[2] (pitch:-0.35);' +
          '[p] (pause:300); [t] "cube" (pitch:0.35); [p] (pause:400)',
      'self::mathml:msubsup', './*[3][text()=3]');
  defineRuleAlias(
      'cube-sub', 'self::mathml:msubsup',
      './mathml:mrow=./*[3]', 'count(./*[3]/*)=1', './*[3]/*[1][text()=3]');

  // MathJax
  defineRule(
      'mj-square', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "square" (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]', './*[1]/*[2]/*[1][text()=2]');
  defineRuleAlias(
      'mj-square', 'self::span[@class="msup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');
  defineRuleAlias(
      'mj-square', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1][text()=2]');
  defineRuleAlias(
      'mj-square', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');

  defineRule(
      'mj-cube', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "cube" (pitch:0.35); [p] (pause:300)',
      'self::span[@class="msup"]', './*[1]/*[2]/*[1][text()=3]');
  defineRuleAlias(
      'mj-cube', 'self::span[@class="msup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');
  defineRuleAlias(
      'mj-cube', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1][text()=3]');
  defineRuleAlias(
      'mj-cube', 'self::span[@class="msubsup"]', 'mathmlmsup',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');

  defineRule(
      'mj-square-sub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35); ' +
          '[p] (pause:300); [t] "square" (pitch:0.35); [p] (pause:400)',
      'self::span[@class="msubsup"]', './*[1]/*[2]/*[1][text()=2]');
  defineRuleAlias(
      'mj-square-sub', 'self::span[@class="msubsup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=2]');

  defineRule(
      'mj-cube-sub', 'Mathjax', 'default.default',
      '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] (pitch:-0.35); ' +
          '[p] (pause:300); [t] "cube" (pitch:0.35); [p] (pause:400)',
      'self::span[@class="msubsup"]', './*[1]/*[2]/*[1][text()=3]');
  defineRuleAlias(
      'mj-cube-sub', 'self::span[@class="msubsup"]',
      './*[1]/*[2]/*[1]=./*[1]/*[2]/span[@class="mrow"]',
      'count(./*[1]/*[2]/*[1]/*)=1', './*[1]/*[2]/*[1]/*[1][text()=3]');
};


}); // goog.scope
