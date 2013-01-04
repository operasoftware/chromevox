// Copyright 2012 Google Inc
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
 * @fileoverview Chromevox extension for Google Finance.
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var financevox = {};

/** constants */
financevox.consts = {
  TRENDS_ROW_WITH_CHANGE: 0,
  TRENDS_ROW_WITHOUT_CHANGE: 1
};

/** speakable formatters */
financevox.speakables = {
  byChanged: ['changed by $change<0>'],
  byline: ['$self'],
  change: ['{user}$self'],
  changeMarket: ['$self'],
  changeSector: ['$self'],
  currencyName: ['$self'],
  currencyRow: [''],
  currencies: ['Currencies: $currencyRow'],
  downCurrency: ['down', ''],
  exchangeRate: ['$self'],
  hasAMarketCap: ['market cap $marketCap'],
  market: ['$marketName changing by $changeMarket'],
  marketCap: ['{user}$self'],
  marketName: ['$self'],
  newsSection: ['{Text}Headline: $newsTitle by $byline<0> $snippet related ' +
                'articles: $relatedArticles<0,1>'],
  marketSymbol: ['$self'],
  marketRow: ['{Text}$marketSymbol $byChanged'],
  newsTitle: ['{antt}$self'],
  numberSectors: ['$self'],
  numTrending: ['$self'],
  relatedArticles: ['$self by $byline'],
  sectorElem: ['$self'],
  sectorRow: ['{Text}$sectorElem<0> changing $sectorElem<1>'],
  sectorSummary: ['{Text}Sector summary: $numberSectors<1> ' +
                  ' sectors have gone up on average, while ' +
                  '$numberSectors<0> have gone down. The best sector ' +
                  'has been $sectorRow<1>, while the worst performing sector ' +
                  'is $sectorRow<0>'],
  snippet: ['$self'],
  stockName: ['{text}$self'],
  trendsRow: ['{Text}$stockName $byChanged $hasAMarketCap',
              '{Text}$stockName',
              ''],
  trendsTable: ['{Text}Trending stocks. $trendsRow',
                '{Text}There are $numTrending stocks in today\'s trending ' +
                'stocks. Highest change is on ' +
                '$trendsRow<0> , and lowest is on $trendsRow<1> ' +
                'In overall the market has gone $upOrDown'],
  topStories: ['{Text}Top stories: $topStoriesTitle<all>'],
  topStoriesTitle: ['$self. \n'],
  upCurrency: ['up', ''],
  upOrDown: ['$self'],
  worldMarkets: ['{Text}World markets: Best performing ' +
                'market is $marketRow<0> while the worst is $marketRow<1>']
};


/** identifiers for speakables */
//TODO add regex support for selectors, support for exclusion
financevox.selectors = {
  change: {query: '.change'},
  changeSector: {tagName: 'span'},
  currencyName: {query: '.symbol'},
  currencyRow: {tagName: 'tr'},
  currencies: {id: 'currencies'},
  exchangeRate: {query: '.price'},
  sectorElem: {tagName: 'td'},
  sectorRow: {tagName: 'tr'},
  stockName: {query: '.name'},
  marketSymbol: {query: '.symbol'},
  marketCap: {query: '.mktCap'},
  trendsRow: {tagName: 'tr'},
  trendsTable: {id: 'trend'},
  sectorSummary: {id: 'secperf'},
  newsSection: {query: '.g-section.news'},
  newsTitle: {query: '.name'},
  byline: {query: '.byline'},
  snippet: {query: '.snippet'},
  relatedArticles: {query: '.rel-article'},
  topStories: {id: 'market-news-stream'},
  topStoriesTitle: {query: '.title'},
  marketRow: {tagName: 'tr'},
  worldMarkets: {id: 'markets'}
};

/** options of speakables */
financevox.options = {
  topStories: ['enableTraverse'],
  trendsTable: ['enableTraverse'],
  newsSection: ['enableTraverse'],
  sectorSummary: ['enableTraverse'],
  worldMarkets: ['enableTraverse'],
  currencies: ['enableTraverse'],
  byChanged: ['dontReadIfSelectorsDontExist'],
  //TODO implement dontreadifselectorsdontexist rule
  hasAMarketCap: ['dontReadIfSelectorsDontExist']
};

/** custom formatting */
financevox.preprocess = {

  /**
   * custom function for trends table reading the overall information
   * @param {Object} values values of table.
   * @param {string} speakable name focused from.
   * @return {Object} the filtered values.
   */

  trendsTable: function(values, focusedFrom) {

    var parsePercent = function(percentStr) {
      return parseFloat(percentStr.replace(/\%/, ''));
    };


    //read first formatter's values,
    if (focusedFrom == 'trendsTable') { //if focused from trends table
      var filterOutTrendRows = function(elem) {

        if (elem.byChanged && elem.byChanged.change &&
            elem.byChanged.change[0] && elem.stockName && elem.stockName[0]) {
          return true;
        }
        return false;
      }

      values.trendsRow = values.trendsRow.filter(filterOutTrendRows);

      var highest, lowest;
      highest = values.trendsRow[0];
      lowest = values.trendsRow[0];
      //TODO make an easier way to get object properties when there's only one
      //write something like speakable.getProperty('change')


      var highestChange = parsePercent(highest.byChanged.change[0].self);
      var lowestChange = parsePercent(lowest.byChanged.change[0].self);
      var totalChange = 0;
      for (row in values.trendsRow) {
        var currChange = parsePercent(
            values.trendsRow[row].byChanged.change[0].self);
        if (currChange > highestChange) {
          highest = values.trendsRow[row];
          highestChange = currChange;
        }
        if (currChange < lowestChange) {
          lowest = values.trendsRow[row];
          lowestChange = currChange;
        }

        totalChange += currChange;
      }
      var avgChange = totalChange / values.trendsRow.length;
      var upOrDown = avgChange > 0 ? 'up' : 'down';
      upOrDown += ' by ' + avgChange + '%';
      values.numTrending = [{self: values.trendsRow.length}];
      values.trendsRow = [highest, lowest];
      values.upOrDown = [{self: upOrDown}];

      var obj = {
        formatter: financevox.speakables.trendsTable[1],
        values: values
      };
      return obj;
    }


  },

  sectorSummary: function(values, focusedFrom) {

    var parsePercent = function(percentStr) {
      return parseFloat(percentStr.replace(/\%/, ''));
    };

    if (focusedFrom == 'sectorSummary') {
      var filterOutSectorRows = function(elem) {
        if (elem.sectorElem && elem.sectorElem.length == 10) {return true;}
      }
      var sectorRows = values.sectorRow.filter(filterOutSectorRows);
      var highestChange = parsePercent(sectorRows[0].sectorElem[1].self);
      var lowestChange = parsePercent(sectorRows[0].sectorElem[1].self);

      var highest, lowest;
      var numSectors = [{self: 0}, {self: 0}];
      highest = sectorRows[0];
      lowest = sectorRows[0];
      //TODO make an easier way to get object properties when there's only one
      //write something like speakable.getProperty('change')
      for (row in sectorRows) {
        var currChange = parsePercent(
            sectorRows[row].sectorElem[1].self);
        if (currChange < 0) {
          numSectors[0].self++;
        } else {
          numSectors[1].self++;
        }

        if (currChange > highestChange) {
          highest = sectorRows[row];
          highestChange = currChange;
        }
        if (currChange < lowestChange) {
          lowest = sectorRows[row];
          lowestChange = currChange;
        }
      }
      values.sectorRow = [lowest, highest];
      values.numberSectors = numSectors;


      var obj = {
        formatter: financevox.speakables.sectorSummary[0],
        values: values
      };
      return obj;
    }

  },

  worldMarkets: function(values, focusedFrom) {
    var parsePercent = function(percentStr) {
      var numWithPercentRegex = /\-?\d+\.\d+ \((\-?\d*.\d*)\%\)/;
      return parseFloat(numWithPercentRegex.exec(percentStr)[1]);
    };

    if (focusedFrom == 'worldMarkets') {
      var worldRows = values.marketRow;
      var highest = worldRows[0];
      var lowest = worldRows[0];
      var highestChange = parsePercent(worldRows[0].byChanged.change[0].self);
      var lowestChange = parsePercent(worldRows[0].byChanged.change[0].self);

      for (row in worldRows) {
        var currChange = parsePercent(
            worldRows[row].byChanged.change[0].self);
        if (currChange > highestChange) {
          highest = worldRows[row];
          highestChange = currChange;
        }
        if (currChange < lowestChange) {
          lowest = worldRows[row];
          lowestChange = currChange;
        }

      }
      values.marketRow = [highest, lowest];

      var obj = {
        formatter: financevox.speakables.worldMarkets[0],
        values: values
      };
      return obj;
    }
  },

  currencyRow: function(values, focusedFrom, target) {
    if (focusedFrom == 'currencies') {
      var obj = {
        formatter: '',
        values: {}
      };
      return obj;
    } else if (focusedFrom == 'currencyRow') {
      var parsePercent = function(percentStr) {
        var numWithPercentRegex = /\-?\d+\.\d+ \((\-?\d*.\d*)\%\)/;
        return parseFloat(numWithPercentRegex.exec(percentStr)[1]);
      };

      var change = parsePercent(values.change[0].self);
      if (change >= 0) {
        var up = true;
      }

      values.change[0].self = Math.abs(EuroDollarChange);
      currencyNames = values.currencyName[0].self.split('/');
      values.currencyName[0].self = currencyNames[0];
      values.currencyName.push({
        self: currencyNames[1]
      });

      var obj = {
        formatter: up ? '$currencyName<0> has gone up $change against ' +
                  '$currencyName<1> with a current rate of 1 ' +
                  '$currencyName<0> equals $exchangeRate $currencyName<1>' :
                  '$currencyName<0> has gone down $change against ' +
                  '$currencyName<1> with a current rate of 1 ' +
                  '$currencyName<0> equals $exchangeRate $currencyName<1>',
        values: values
      };
      return obj;
    }
  }

};

/** extension options */
financevox.extensionOptions = [
  'enableAutoTraversal',
  'enableElementFineScroll'
];


/** url to run extension in */
financevox.url = [];

cvoxExt.loadExtension(financevox);
