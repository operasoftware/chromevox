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
 * @fileoverview Chromevox extension for Google Finance Stock Screener.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var financeStockScreenerVox = {};

/** @const constants */
financeStockScreenerVox.consts = {
  TRENDS_ROW_WITH_CHANGE: 0,
  TRENDS_ROW_WITHOUT_CHANGE: 1
};

/** speakable formatters */
financeStockScreenerVox.speakables = {
  marketCapFilter: ['market cap filter between $min dollars and $max dollars ' +
  'covering $histogram \% of companies'],
  peRatioFilter: ['P E ratio filter between $min and $max covering ' +
  '$histogram \% of companies'],
  divYieldFilter: ['Dividend yield filter between $min\% and $max\% covering ' +
  '$histogram \% of companies'],
  wPriceChange: ['52 week price change filter between $min \% and $max \% ' +
  'covering $histogram \% of companies'],
  min: ['$self'],
  max: ['$self'],
  histogram: ['$self'],
  inputBox: ['$self'],
  companiesTable: ['table of companies highlights: largest company: ' +
  '$company<0>. smallest company: $company<1>. company with best price ' +
  'change over 52 weeks: $company<2>. company with largest dividend yield: ' +
  '$company<3>.'],
  company: ['$companyInfo<0>, market cap: $companyInfo<2>, price change ' +
  'in last 52 weeks: $companyInfo<5> percent'],
  companyInfo: ['$self']
};


/** identifiers for speakables */
financeStockScreenerVox.selectors = {
  marketCapFilter: {id: 'row_MarketCap'},
  inputBox: {className: 'field_input_default'},
  peRatioFilter: {id: 'row_PE'},
  divYieldFilter: {id: 'row_DividendYield'},
  wPriceChange: {id: 'row_Price52WeekPercChange'},
  min: {query: '.align_left_td'},
  max: {query: '.align_right_td'},
  histogram: {query: '.histogram_td'},
  companiesTable: {
    query: '.advanced_search_results.results.innermargin.gf-table'
  },
  company: {
    tagName: 'tr'
  },
  companyInfo: {
    tagName: 'td'
  }
};

/** options of speakables */
financeStockScreenerVox.options = {
  marketCapFilter: ['enableTraverse'],
  peRatioFilter: ['enableTraverse'],
  divYieldFilter: ['enableTraverse'],
  wPriceChange: ['enableTraverse'],
  companiesTable: ['enableTraverse']

};

/** custom formatting */
financeStockScreenerVox.preprocess = {

  /** preprocess for companies table. calculates best
  performing companies by looking at their daily stock price change and dividend
  yields. also calculates which one has the highest and lowest market caps
  * @param {Object} values the values tree of companies table, including
  * stock price and market cap of each company.
  * @param {string} focusedFrom where object is focused from.
  * @param {HTMLElement} target the companies table .
  * @return {Object} the values tree including the companies with highest and
  * lowest market caps, highest price change and highest dividend yield and the
  * formatter which reads them intelligently.
  */
  companiesTable: function(values, focusedFrom, target) {

    var filterCompanyRows = function(elem) {
      if (elem.companyInfo && elem.companyInfo.length == 7) {
        return true;
      }
    }

    // parse money by replacing M and B with multiplications
    var parseMoney = function(num) {
      if (num.indexOf('M') != -1) {
        var money = parseFloat(num.replace('M', '')) * 1000000;
      } else if (num.indexOf('B') != -1) {
        money = parseFloat(num.replace('B', '')) * 1000000000;
      }
      return money;
    }
    var parsePercent = function(num) {
      return parseFloat(num.replace('\%', ''));
    }
    var companies = values.company.filter(filterCompanyRows).slice(1);


    // find the largest market cap, smallest market cap, best price change and
    // largest dividend yield companies
    var largestMarkCap = companies[0];
    var smallestMarkCap = companies[0];
    var bestPriceChange = companies[0];
    var largestDiv = companies[0];
    for (c in companies) {
      var compInfo = companies[c].companyInfo;
      if (parseMoney(compInfo[2].self) >
          parseMoney(largestMarkCap.companyInfo[2].self)) {
        largestMarkCap = companies[c];
      }
      if (parseMoney(compInfo[2].self) <
          parseMoney(largestMarkCap.companyInfo[2].self)) {
        smallestMarkCap = companies[c];
      }
      if (parsePercent(compInfo[4].self) >
          parsePercent(largestDiv.companyInfo[4].self)) {
        largestDiv = companies[c];
      }
      if (parsePercent(compInfo[5].self) >
          parsePercent(bestPriceChange.companyInfo[5].self)) {
        bestPriceChange = companies[c];
      }
    }

    values.company = [largestMarkCap, smallestMarkCap, bestPriceChange,
      largestDiv];

    var obj = {
      formatter: financeStockScreenerVox.speakables.companiesTable[0],
      values: values
    };
    return obj;
  },

  /**
   * custom read the minimum filter text field
   * @param {Object} values value in text field.
   * @param {string} focusedFrom speakable name focused from.
   * @param {HTMLElement} target focused text field.
   * @return {Object} value binded with formatter for minimum filter.
   */
  min: function(values, focusedFrom, target) {
    var min = target.getElementsByTagName('input')[0].value;
    values.self = min;

    var obj = {
      formatter: financeStockScreenerVox.speakables.min[0],
      values: values
    };
    return obj;
  },


  /**
   * custom read the maximum filter text field
   * @param {Object} values value in text field.
   * @param {string} focusedFrom speakable name focused from.
   * @param {HTMLElement} target focused text field.
   * @return {Object} value binded with formatter for minimum filter.
   */
  max: function(values, focusedFrom, target) {

    var max = target.getElementsByTagName('input')[0].value;
    values.self = max;
    var obj = {
      formatter: financeStockScreenerVox.speakables.max[0],
      values: values
    };
    return obj;
  },


  /**
   * calculate the ratio of sum of pixels of the graph in the filtered area
   * versus the total pixels to calculate what percent of companies are filtered
   * out
   * @param {Object} values the pixel values of each column.
   * @param {string} focusedFrom speakable name focused from.
   * @param {HTMLElement} target the graph as DOM element.
   * @return {Object} the percent of companies filtered binded with formatter.
   */
  histogram: function(values, focusedFrom, target) {


    //check which of the filters is focused and get the appropriate slider
    //on the chart for that value
    if (focusedFrom == 'marketCapFilter') {
      var sliderLeft = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_MarketCap_left'})[0];
      var leftSideBound = parseInt(sliderLeft.style.left.replace('px', ''));
      var sliderRight = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_MarketCap_right'})[0];
      var rightSideBound = parseInt(sliderRight.style.left.replace('px', ''));

    } else if (focusedFrom == 'peRatioFilter') {
      sliderLeft = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_PE_left'})[0];
      leftSideBound = parseInt(sliderLeft.style.left.replace('px', ''));
      sliderRight = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_PE_right'})[0];
      rightSideBound = parseInt(sliderRight.style.left.replace('px', ''));

    } else if (focusedFrom == 'divYieldFilter') {
      sliderLeft = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_DividendYield_left'})[0];

      leftSideBound = parseInt(sliderLeft.style.left.replace('px', ''));
      sliderRight = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_DividendYield_right'})[0];
      rightSideBound = parseInt(sliderRight.style.left.replace('px', ''));

    } else if (focusedFrom == 'wPriceChange') {
      sliderLeft = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_Price52WeekPercChange_left'})[0];
      leftSideBound = parseInt(sliderLeft.style.left.replace('px', ''));
      sliderRight = Util.getVisibleDomObjectsFromSelector(
          {id: 'slider_Price52WeekPercChange_right'})[0];
      rightSideBound = parseInt(sliderRight.style.left.replace('px', ''));

    } else {
      var obj = {
        done: true
      };

      return obj;
    }

    // for each column get the sum of its pixels and check if it is in the
    // slider. then calculate the ratio of sum of pixels in the slider to
    // the whole sum of pixels

    //get the width of histogram table from anyone
    var table = document.getElementById('histogram_MarketCap_table');
    tableWidth = window.getComputedStyle(table).width.replace('px', '');
    var cols = Util.getVisibleDomObjectsFromSelector({tagName: 'td'}, target);
    var colorCols = [];

    //just get the blue columns
    for (var i = 0, o; o = cols[i]; i++) {
      var childDiv = o.getElementsByTagName('div')[0];
      if (childDiv &&
        childDiv.getAttribute('style').indexOf(
            'background-color:#0F6FDF') != -1) {
        colorCols.push(childDiv);
      }
    }
    var colorColsLen = colorCols.length;
    var totalExcluded = 0;
    var totalInclusive = 0;
    for (var i = 0, o; o = colorCols[i]; i++) {

      var colDiv = o;
      var approxPixelLocation = i / colorCols.length * tableWidth;
      if (approxPixelLocation < leftSideBound) {

        totalExcluded += parseFloat(colDiv.style.height.replace('px', '')) - 1;
      } else if (approxPixelLocation < rightSideBound) {

        totalInclusive += parseFloat(colDiv.style.height.replace('px', '')) - 1;
      } else {

        totalExcluded += parseFloat(colDiv.style.height.replace('px', '')) - 1;
      }

    }

    var includedRatio = (totalInclusive) / (totalInclusive + totalExcluded) *
        100;
    values.self = Math.round(includedRatio);
    var obj = {
      formatter: financeStockScreenerVox.speakables.histogram[0],
      values: values
    };
    return obj;
  },

  /**
   * descriptively read when an input box is focused
   * @param {Object} values value of text field.
   * @param {string} focusedFrom Speakable focused from.
   * @param {HTMLElement} target the input box DOM element.
   * @return {Object} the text field value and the formatter of the appropriate
   * filter type.
   */
  inputBox: function(values, focusedFrom, target) {
    values.self = target.value;

    var formatter = '';
    var id = target.id;
    if (id == 'MarketCap_left') {
      formatter += 'Filter by minimum market cap {user} $self {antt}edit';
    } else if (id == 'MarketCap_right') {
      formatter += 'Filter by maximum? {user} $self {antt}edit';
    } else if (id == 'PE_left') {
      formatter += 'Filter by minimum P E ratio $self {antt}edit';
    } else if (id == 'PE_right') {
      formatter += 'Filter by maximum? {user} $self {antt}edit';
    } else if (id == 'DividendYield_left') {
      formatter += 'Filter by minimum dividend yield percent {user} $self ' +
      '{antt}edit';
    } else if (id == 'DividendYield_right') {
      formatter += 'Filter by maximum? {user} $self {antt}edit';
    } else if (id == 'Price52WeekPercChange_left') {
      formatter += 'Filter by 52 week price change {user} $self percent ' +
      '{antt}edit';
    } else if (id == 'Price52WeekPercChange_right') {
      formatter += 'Filter by maximum? $self percent {antt}edit';
    } else {
      var obj = {
        done: true
      };
      return obj;
    }
    var obj = {
      formatter: formatter,
      values: values
    };
    return obj;
  }

};


/** extension options */
financeStockScreenerVox.extensionOptions = [
  'enableAutoTraversal'
];

/** url to run extension in */
financeStockScreenerVox.url = [];

/** speaks the number of shown stocks on table
 * @param {Array<Mutation>} mutations the mutations to check for.*/
financeStockScreenerVox.onStockLoad = function(mutations) {
  console.log('here');
  var numCompanies =
  Util.getVisibleDomObjectsFromSelector({query:
      '.id-searchresultssummary' })[0];
  cvox.Api.speak('Now showing ' + numCompanies.textContent);

};

/** checks if the stock table has loaded, if so attaches the DOM mutation
 * listener to it
 */
financeStockScreenerVox.loadStocktable = function() {
  var stockTable = Util.getVisibleDomObjectsFromSelector(
      {query: '.id-searchresultssummary'});
  if (stockTable.length == 0) {
    setTimeout(financeStockScreenerVox.loadStocktable, 20);
    return;
  }

  var observer = new WebKitMutationObserver(
      financeStockScreenerVox.onStockLoad);
  observer.observe(stockTable[0], {childList: true, subtree: true,
    attributes: true });
};

cvoxExt.loadExtension(financeStockScreenerVox,
    financeStockScreenerVox.loadStocktable);


