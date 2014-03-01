var SERVER_URL = "http://localhost:8080",
   CLIENT_URL = "http://localhost:8000",
   CST,
   SSO;

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



function render() {

   $('#login').hide();
   $('#interface').show();

   $.ajax({
      url: 'http://localhost:8080/currentlytrading',
      success: function(data) {
         getIndex(data, function(scores, epicsMap){
            for (epic in scores) {
               epicsMap[epic].index = scores[epic].index;
               epicsMap[epic].sentiment = scores[epic].sentiment;
            }
            initChart(processData(epicsMap, 'index'), '#currently_trading', 'My Currently Trading Markets')
         })
      }
   });

//   $.ajax({
//      url: 'http://localhost:8080/suggestedmarkets',
//      success: function(data) {
//         initChart(processData(data), '#suggested_markets', 'Markets from my watchlists and recent history')
//      }
//   });

   function getIndex(data, callback){
      var epics = data.map(function(market){
         return market.epic;
      }).join(',');
      var epicsMap = {};
      data.forEach(function(market){
         epicsMap[market.epic] = market;
      });

      $.ajax({
         type: 'GET',
         url: 'http://localhost:8080/everything/sentiment,twitter,volatility/' + epics,
         success: function(scores) {
            callback(scores, epicsMap);
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
}
