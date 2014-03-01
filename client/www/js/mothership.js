var SERVER_URL = "http://localhost:8080",
   CLIENT_URL = "http://localhost:8000",
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
}
$(document).ready(init);

function getMarketData(){
   $.ajax({
      url: 'http://localhost:8080/suggestedmarkets',
   }).done(function(sdata) {
         suggestMarketsEpics = sdata.map(function(market){
            return market.epic;
         }).join(',');

         suggestMarketsEpicsMap = sdata.reduce(function(map, market){
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

               currentlyTradingPoller = pollService.bind(null, currentlyTradingEpics, currentlyTradingEpicsMap, '#currently_trading', 'My Currently Trading Markets', function() {
                 /* suggestMarketTimeout = setTimeout(function() {
                     suggestMarketPoller();
                  }, TIMEOUT);    */
               });
               suggestMarketPoller = pollService.bind(null, suggestMarketsEpics, suggestMarketsEpicsMap, '#suggested_markets', 'Markets from my watchlists and recent history', function() {
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
            epicMap[epic].sentiment = scores[epic].sentiment;
         }
         if (callback) {
            callback(scores, epicMap);
         }
         initChart(processData(epicMap, 'index'), elementId, title);
      },
      error: function() {
         clearTimeout(suggestMarketTimeout);
         clearTimeout(currentlyTradingTimeout);
         clearTimeout(errorTimeout);
         errorTimeout = setTimeout(function() {
            pollService.apply(null, args);
         }, TIMEOUT);
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
         pie: {
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
