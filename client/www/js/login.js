$(document).ready(function(){

   var SERVER_URL = "http://localhost:8080",
       CLIENT_URL = "http://localhost:8000";

   var $form = $('form'),
       data;

   $form.on('submit', function(ev){
      ev.preventDefault();
      data = $(this).serialize();
      $.post(SERVER_URL + '/login', data, function(){
         window.location = CLIENT_URL + "/pies.html";
      }).fail(function(err) {
         alert(err);
      });
   });


});