

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
    var logout_template;

    var renderloggedin = function(result){
    $('#logout').html(logout_template());
    }

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
      if(UserService.isLoggedin()){
        var logout_source = $('#logout_template').html();
        logout_template = Handlebars.compile(logout_source);
        var temp = DB.User.me.username;
        $("#welcome").text('Hey ' + temp + ", have fun!");
        UserService.welcome();
        renderloggedin();
      }
      else{
      var source = $('#user_area').html();
      template = Handlebars.compile(source);
        $("#welcome").text('Hey Guest, please login or register.');        
        render();
      }
      
    }
  };
  return ctrl;
})();

DB.ready(UserController.onReady);
