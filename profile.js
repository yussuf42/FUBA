//Let's connect to our Baqend
DB.connect("http://fuba.baqend.com");

var ProfileService = (function(){
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
})