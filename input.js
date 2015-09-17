/*
  Input.js takes care of posting new questions typed by users into the database.
  In detail :
  InputService has only one function "isLoggedin", which checks if the user is logged in, because the whole Input-Section only shows for logged in Users.
*/
var InputService = (function(){
  return{
    isLoggedin: function(){
      if (DB.User.me) {
        return true;
      } 
      else {
        return false;
      }
    },
  }
})();

/*
  The InputController takes care of filling the Input-template with the required form if the user is logged in,
  we only need render and onReady because there's no data coming from the Database and the Read-to-DB is taken care of in app.js
*/


var InputController= (function() {
  var template;
  var render = function(result) {
    $('#input_area').html(template());
    $('#input_area').css("display","block");
  };

  var ctrl = {
    onReady: function() {
      var source= $("#inputs").html();
      template = Handlebars.compile(source);
      if(InputService.isLoggedin())
    render();
    }
  };


  return ctrl;

})();



DB.ready(InputController.onReady);
