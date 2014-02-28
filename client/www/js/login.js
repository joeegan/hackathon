(function(){

   $(document).ready(function(){

   var $form = $('form');
   $form.on('submit', function(ev){
      ev.preventDefault();
      var data = $(this).serialize();
      $.post('http://localhost:8080/login', data, function(response){
         console.log(response);
         response = JSON.parse(response);
         $form.hide();
         document.write('You\'ve logged in ' + response.currentAccountId + ', congrats');
      });
   });


   });

})();