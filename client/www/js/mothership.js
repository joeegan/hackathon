var SERVER_URL = "http://localhost:8080",
   CLIENT_URL = "http://localhost:8888",
   CST,
   TIMEOUT = 60000,
   START_TIMEOUT = 1000,
   suggestMarketsEpics,
   suggestMarketsEpicsMap,
   suggestMarketPoller,
   currentlyTradingEpics,
   currentlyTradingEpicsMap,
   currentlyTradingPoller,
   suggestMarketTimeout,
   currentlyTradingTimeout,
   errorTimeout,
   firstLoad = true,
   selectedFeeds = [];

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
         render();
      }).fail(function(err) {
            alert(err);
         });
   });

   $('#login').show();
   $('#interface').hide();
   $('#twitter').hide();
   $('#sentiment').hide();
   $('#volatility').hide();
   $('#movement').hide();
}
$(document).ready(init);

function getMarketData(){
   $.ajax({
      url: 'http://localhost:8080/suggestedmarkets'
   }).done(function(data) {
         suggestMarketsEpics = data.map(function(market){
            return market.epic;
         }).join(',');

         suggestMarketsEpicsMap = data.reduce(function(map, market){
            map[market.epic] = market;
            return map;
         }, {});

         $.ajax({
            url: 'http://localhost:8080/currentlytrading'
         }).done(function(data) {
               currentlyTradingEpics = data.map(function(market){
                  return market.epic;
               }).join(',');

               currentlyTradingEpicsMap = data.reduce(function(map, market){
                  map[market.epic] = market;
                  return map;
               }, {});

               currentlyTradingPoller = pollService.bind(null, currentlyTradingEpics, currentlyTradingEpicsMap, '#currently_trading', 'Currently traded markets', function() {
                 /* suggestMarketTimeout = setTimeout(function() {
                     suggestMarketPoller();
                  }, TIMEOUT);    */
               });
               suggestMarketPoller = pollService.bind(null, suggestMarketsEpics, suggestMarketsEpicsMap, '#suggested_markets', 'Suggested and recently traded markets', function() {
                  currentlyTradingTimeout = setTimeout(function() {
                     currentlyTradingPoller();
                     firstLoad = false;
                  }, firstLoad ? START_TIMEOUT : TIMEOUT);
               });

               suggestMarketPoller();
            });
      });
}

function pollService(epics, epicMap, elementId, title, callback) {
   var args = arguments;
   $.ajax({
      type: 'GET',
      url: 'http://localhost:8080/everything/' + selectedFeeds.join(',') + '/' + epics,
      success: function(scores) {
         for (var epic in scores) {
            epicMap[epic].index = scores[epic].index;
            if (scores[epic].sentiment) {
               epicMap[epic].sentiment = scores[epic].sentiment;
            }
            if (scores[epic].twitter) {
               epicMap[epic].twitter = scores[epic].twitter;
            }
         }
         if (callback) {
            callback(scores, epicMap);
         }
         initChart(processData(epicMap, 'index'), elementId, title);
         /*suggestMarketTimeout = setTimeout(function() {
            pollService.apply(null, args);
         }, 10000);*/
      }
   });
}

function processData(data, key) {
   var total = 0;
   for (market in data) {
      var score = data[market][key];
      total += score;
   }
   for (market in data) {
      var score = data[market][key];
      data[market].y = (score/total) * 100;
   }
   return $.map(data, function(item) {
      return [item];
   });
}

function initChart(data, selector, title) {

   $(selector).highcharts({
      chart: {
         plotBackgroundColor: null,
         plotBorderWidth: null,
         plotShadow: false
      },
      title: {
         text: title
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
            },
            point: {
               events: {
                  click: function() {
                     var d = data.filter(function(market){
                        return market.epic == this.epic
                     }.bind(this))[0];
                     updateTwitterUi(d.twitter);
                     updateSentimentUi(d.sentiment);
                  }
               }
            }
         }
      },
      series: [{
         type: 'pie',
         name: 'Open position',
         data: data
      }]
   });
}

function render() {

   $('#login').hide();
   $('#interface').show();

   $('#feeds').on('click', 'input', function() {
      if ($(this).prop('checked')) {
         selectedFeeds.push(this.value);
      } else if (selectedFeeds.indexOf(this.value) > -1) {
         selectedFeeds.splice(selectedFeeds.indexOf(this.value), 1);
      }
      $('#streaming').prop('checked', false);
      clearTimeout(suggestMarketTimeout);
      clearTimeout(currentlyTradingTimeout);
      if ($('#feeds :checked').length) {
         firstLoad = true;
         suggestMarketPoller();
      }
   }).find('input:checked').each(function() {
         selectedFeeds.push(this.value);
      });


   $('#streaming').click(function() {
       if ($(this).prop('checked')) {
          clearTimeout(suggestMarketTimeout);
          clearTimeout(currentlyTradingTimeout);
          clearTimeout(errorTimeout);
          firstLoad = true;
          suggestMarketPoller();
       }
   });
   getMarketData();
}

function updateTwitterUi(data) {

   if (!data) {
      $('#twitter').hide();
      return;
   }
   $('.twitter').show();
   $('.twitter-index').html(data.index.toFixed(1));
   $('.twitter-count').html(data.count);
   $('.twitter-tweets').empty();
   data.tweets.forEach(function(tweet) {
      $('.twitter-tweets').append('<td>' + tweet + '</td>');
   });
}

function updateSentimentUi(data) {

   if (!data) {
      $('#sentiment').hide();
      return;
   }
   $('#sentiment').show();
   $('.sentiment-index').html(data.index.toFixed(1));
   $('.sentiment-dir').html(data.longPositionPercentage >= 50 ? 'long' : 'short');
   $('.sentiment-pie').highcharts({
      chart: {
         plotBackgroundColor: null,
         plotBorderWidth: null,
         plotShadow: false
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

