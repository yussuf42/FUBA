//Let's connect to our Baqend
DB.connect("http://fuba.baqend.com");

var RegisterService = (function(){
	return{
		register: function(user, password){
			if(DB.User.register("herdfk@hark.de", "password"))
				alert('42');
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
		$('#stupid_area').html(template());
	};

	var ctrl = {
		register: function(user, password){
			UserService.register(user,password).then(render);
		},
		onReady: function(){
			if(!RegisterService.isLoggedin())
				RegisterController.redirect();
		},
		redirect: function(){
			var source = $('#stupid_msg').html();
		    template = Handlebars.compile(source);
		    render();
		}
	};
	return ctrl;
})();

DB.ready(RegisterController.onReady);