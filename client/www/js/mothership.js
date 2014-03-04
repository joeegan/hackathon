var SERVER_URL = "http://localhost:8080",
   CLIENT_URL = "http://localhost:8888",
   ROUND_ROBIN_TIME = 1500,
   BREAKDOWN_STREAMING_TIME = 2500,
   feeds = {
      sentiment: {
         url: SERVER_URL+'/sentiment/',
         render: renderSentiment
      },
      twitter: {
         url: SERVER_URL+'/twitter/',
         render: renderTwitter
      },
      volatility: {
         url: SERVER_URL+'/volatility/',
         render: renderVolatility
      },
      movement: {
         url: SERVER_URL+'/movement/',
         render: renderMovement
      }
   },
   feedKeys = Object.keys(feeds),
   selectedFeeds = [],
   displayedCharts = [],
   displayedMarket;

function init() {

   var $form = $('form'),
      data;

   $form.on('submit', function(ev){
      ev.preventDefault();
      data = $(this).serialize();
      $.post(SERVER_URL + '/login', data, function(details) {
         $.ajaxSetup({
            headers: {
               'X-SECURITY-TOKEN': details['X-SECURITY-TOKEN'],
               'CST': details['CST']
            }
         });
         showInterface();
      }).fail(function(err) {
         alert('Login failed');
         console.log(err);
      });
   });

   $('#feeds input:checked').each(function() {
      selectedFeeds.push(this.value);
   });

   $('#feeds').on('click', 'input', function() {
      if ($(this).prop('checked')) {
         selectedFeeds.push(this.value);
      } else if (selectedFeeds.indexOf(this.value) > -1) {
         selectedFeeds.splice(selectedFeeds.indexOf(this.value), 1);
      }
      if (displayedMarket) {
         displayBreakdown(displayedMarket);
      }
   });

   $('#login').show();
   $('#interface').hide();
   $('#twitter').hide();
   $('#sentiment').hide();
   $('#volatility').hide();
   $('#movement').hide();
}
$(document).ready(init);

function showInterface() {

   $('#login').hide();
   $('#interface').show();

   loadSuggestedMarkets(function(suggestedMarkets, tradingMarkets) {
      initChart(tradingMarkets, '#currently_trading', 'Currently traded markets');
      initChart(suggestedMarkets, '#suggested_markets', 'Suggested markets');
      startBreakdownStreaming();
   });
}

function loadSuggestedMarkets(callback) {

   var suggestedMarkets,
      tradingMarkets;

   $.ajax({
      url: SERVER_URL+'/suggestedmarkets'
   }).done(function(data) {
      suggestedMarkets = initMarketsChartData(data);
      $.ajax({
         url: SERVER_URL+'/currentlytrading'
      }).done(function(data) {
         tradingMarkets = initMarketsChartData(data);
         callback(suggestedMarkets, tradingMarkets);
      });
   });
}

function initMarketsChartData(markets) {

   var data = [];

   for (var market in markets) {
      markets[market].feeds = {};
      markets[market].indexes = {};
      markets[market].index = 1;
      data.push({
         name: markets[market].name,
         market: markets[market],
         y: Object.keys(markets).length / 100
      });
   }

   return data;
}

function initChart(data, selector, title) {

   $(selector).highcharts({
      chart : {
         events : {
            load : function() {
               displayedCharts.push({
                  chart: this.series[0],
                  data: data
               });
               selectFeeds(this.series[0], data);
               startRoundRobin(this.series[0], data);
            }
         }
      },
      title: {
         text: title
      },
      tooltip: {
         pointFormat: '<b>{point.percentage:.f}%</b>'
      },
      plotOptions: {
         series: {
            slicedOffset: 0,
            animation: true,
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
               enabled: true,
               color: '#000000',
               connectorColor: '#000000',
               format: '<b>{point.name}</b> {point.percentage:.1f} %'
            },
            point: {
               events: {
                  click: function() {
                     displayBreakdown(this.market);
                  }
               }
            }
         }
      },
      series: [{
         type: 'pie',
         data: data
      }]
   });
}

function selectFeeds(chart, data) {

   $('#feeds').on('click', 'input', function() {
      calculateIndexes(data);
      computeChartData(chart, data);
   });
}

function startRoundRobin(chart, data) {

   var currentFeed = 0,
      currentMarket = 0;

   function frame() {

      var feedName = feedKeys[currentFeed],
         feed = feeds[feedName],
         currentMarketData = data[currentMarket];

      $.ajax({
         url: feed.url + currentMarketData.market.epic
      }).done(function(result) {

         updateFeed(result, currentMarketData.market, feedName);
         calculateIndex(currentMarketData);
         computeChartData(chart, data);

         if (displayedMarket && displayedMarket.epic == currentMarketData.market.epic) {
            displayBreakdown(displayedMarket);
         }

         currentMarket++;
         if (currentMarket >= data.length) {
            currentMarket = 0;
            currentFeed++;
            if (currentFeed >= feedKeys.length) {
               currentFeed = 0;
            }
         }

      }).always(function() {

         setTimeout(frame, ROUND_ROBIN_TIME);
      });
   }

   setTimeout(frame, ROUND_ROBIN_TIME);
}

function startBreakdownStreaming() {

   var currentFeed = 0;

   function frame() {

      if (!displayedMarket || !$('#streaming').prop('checked')) {
         setTimeout(frame, BREAKDOWN_STREAMING_TIME);
         return;
      }

      var feedName = feedKeys[currentFeed],
         feed = feeds[feedName],
         currentMarkets,
         currentMarketData,
         i;

      $.ajax({
         url: feed.url + displayedMarket.epic
      }).done(function(result) {

         for (i = 0; i < displayedCharts.length; i++) {
            currentMarkets = displayedCharts[i].data.filter(function(d){ return d.market.epic == displayedMarket.epic });
            if (currentMarkets.length) {
               currentMarketData = currentMarkets[0];
               updateFeed(result, currentMarketData.market, feedName);
               calculateIndex(currentMarketData);
               computeChartData(displayedCharts[i].chart, displayedCharts[i].data);
            }
         }

         displayBreakdown(displayedMarket);

         currentFeed++;
         if (currentFeed >= feedKeys.length) {
            currentFeed = 0;
         }

      }).always(function() {

         setTimeout(frame, BREAKDOWN_STREAMING_TIME);
      });
   }

   setTimeout(frame, BREAKDOWN_STREAMING_TIME);
}

function updateFeed(result, market, name) {

   market.feeds[name] = result;
   market.indexes[name] = result.index;
}

function calculateIndexes(data) {

   data.forEach(calculateIndex);
}

function calculateIndex(data) {

   var sum = 0,
      feed;

   if (selectedFeeds.length == 0) {
      data.market.index = 1;
      return;
   }

   for (feed in data.market.indexes) {
      if (selectedFeeds.indexOf(feed) > -1) {
         sum += data.market.indexes[feed];
      }
   }

   data.market.index = sum / selectedFeeds.length;
}

function computeChartData(chart, data) {

   var total = 0,
      market;

   for (market in data) {
      total += data[market].market.index;
   }
   for (market in data) {
      data[market].y = (data[market].market.index / total) * 100;
   }

   chart.setData(data, true);
}

function displayBreakdown(market) {

   var feed;

   displayedMarket = market;

   $('#title').html(market.name);

   for (feed in feeds) {
      feeds[feed].render(market.feeds[feed]);
   }
}

function renderTwitter(data) {

   if (!data || selectedFeeds.indexOf('twitter') == -1) {
      $('#twitter').hide();
      return;
   }
   $('#twitter').show();
   $('.twitter-index').html(data.index.toFixed(1));
   $('.twitter-count').html(data.count);
   $('.twitter-tweets').empty();
   data.tweets.forEach(function(tweet) {
      $('.twitter-tweets').append('<div>' + tweet + '</div>');
   });
}

function renderSentiment(data) {

   if (!data || selectedFeeds.indexOf('sentiment') == -1) {
      $('#sentiment').hide();
      return;
   }
   $('#sentiment').show();
   $('.sentiment-index').html(data.index.toFixed(1));
   $('.sentiment-dir').html(data.longPositionPercentage >= 50 ? 'long' : 'short');
   $('.sentiment-pie').highcharts({
      chart: {
         backgroundColor: '#eee'
      },
      title: {
         text: ''
      },
      tooltip: {
         pointFormat: '<b>{point.y:.f}%</b>'
      },
      plotOptions: {
         series: {
            animation: false,
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
               enabled: true,
               color: '#000000',
               connectorColor: '#000000',
               format: '<b>{point.name}</b> {point.y:.1f} %'
            }
         }
      },
      series: [{
         type: 'pie',
         data: [
            { name: 'Long', y: data.longPositionPercentage },
            { name: 'Short', y: data.shortPositionPercentage }
         ]
      }]
   });
}

function renderVolatility(data) {

   if (!data || selectedFeeds.indexOf('volatility') == -1) {
      $('#volatility').hide();
      return;
   }
   $('#volatility').show();
   $('.volatility-index').html(data.index.toFixed(1));
   $('.volatility-text').html(data.index<3 ? 'not very volatile' : (data.index>7 ? 'very volatile' : 'quite volatile'));
}

function renderMovement(data) {

   if (!data || selectedFeeds.indexOf('movement') == -1) {
      $('#movement').hide();
      return;
   }
   $('#movement').show();
   $('.movement-index').html(data.index.toFixed(1));
   $('.movement-text').html(data.index<3 ? 'not moving very much' : (data.index>7 ? 'moving a lot' : 'moving a fair amount'));
}