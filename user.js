

var UserService= (function(){
  return{
    login: function(user, password){
      return DB.User.login(user, password).then(function() {
      });
    },
    logout: function(){
      DB.User.logout();
    },
    isLoggedin: function(){
      if (DB.User.me) {
        return true;
      } 
      else {
        return false;
      }
    },
    welcome: function(){
      return 'Hello' + DB.User.me.username; 
    }
  }
  })();


  var UserController= (function(){
    var template;

    var render = function(result){
    $('#login').html(template());  //TODO!!!!!
  };
  var ctrl = {
    login: function(user,password){
      UserService.login(user,password);
    },
    logout: function(){
      UserService.logout();
    },
    onReady: function(){
      var source = $('#user_area').html();
      template = Handlebars.compile(source);
      if(UserService.isLoggedin()){
        var temp = DB.User.me.username;
        $("#welcome").text('Hey ' + temp + ", wazzup?");
        UserService.welcome();
      }
      else{
        $("#welcome").text('Hey Stupid, log in to use our site or else...');        
      }
      render();
      
    }
  };
  return ctrl;
})();

DB.ready(UserController.onReady);
