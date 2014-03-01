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
      url: 'http://localhost:8080/positions',
      success: function(data) {
         initChart(processData(data, 'quantity'))
      }
   });

   function processData(data, key) {
      data.forEach(function(position){
         position.y = (position[key]/10)*100;
      });
      return data;
   }

   function initChart(data) {

      $('#currently_trading').highcharts({
         chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
         },
         title: {
            text: 'Markets in my Open Positions'
         },
         tooltip: {
            pointFormat: '{series.name}: <b>{point.y.f}%</b>'
         },
         plotOptions: {
            pie: {
               allowPointSelect: true,
               cursor: 'pointer',
               dataLabels: {
                  enabled: true,
                  color: '#000000',
                  connectorColor: '#000000',
                  format: '<b>{point.name}</b>:{point.epic} {point.y:.1f} %'
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
