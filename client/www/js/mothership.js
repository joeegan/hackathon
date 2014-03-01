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
         CST = details['CST'];
         SSO = details['X-SECURITY-TOKEN'];
         render();
      }).fail(function(err) {
         alert(err);
      });
   });
}
$(document).ready(init);

function render() {
   alert(CST);
}
