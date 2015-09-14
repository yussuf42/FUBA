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
	}
})();


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
