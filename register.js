/*
	register.js is only used on /register.html .The RegisterService is taking care of the Db-Access, in detail :
	"register" registers a user once it passed the validation.
	"logout" logs the user out.
	"isLoggedin" just checks if the user is logged in, you knew this already huh ?!
	"getusername" just gets the username from the database and is fairly redundant as the DB-Access couldve been realised in the Controller below. However, a strict Seperation of Logic and DB-Access isn't the worst thing.
*/
var RegisterService = (function(){
	return{
		register: function(user, password){
			DB.User.register(user, password);
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
		getusername: function(){
			return DB.User.me.username;
		}
	}
})();


/*
	The RegisterController takes care of the one script at /register.html and renders it.
	"register" and "logout" are pretty self-explanatory
	"redirect" is a case of very bad function naming. This function doesn't redirect at all, but is more of a onReady-Extension iff the user is logged in.
*/
var RegisterController = (function(){
	var template;

	var render = function(result){
		$('#stupid_msg').html(template());
	};

	var ctrl = {
		register: function(user, password){
			RegisterService.register(user,password);
		},
		logout: function(){
			RegisterService.logout();
		},
		onReady: function(){
			if(RegisterService.isLoggedin())
				RegisterController.redirect();
			$('.username').html(RegisterService.getusername);

		},
		redirect: function(){
			var source = $('#stupid_area').html();
			template = Handlebars.compile(source);
			render();
		}
	};
	return ctrl;
})();

DB.ready(RegisterController.onReady);
