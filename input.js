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

var InputController= (function() {
  var template;


  var render = function(result) {
    $('#input_area').html(template());
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
