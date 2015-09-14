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
		userquestions: function(){
			var temp_user = DB.User.me.username;
			return DB.Questions.find()
			.equal('Q_Asker', temp_user)
			.resultList();
		},
		user: function(){
			var temp_user = DB.User.me.username;
			return DB.User.find()
			.equal('username', temp_user)
			.resultList();			
		},
		answers: function(){
			var temp_user = DB.User.me.username;
			return DB.Answers.find()
			.equal('A_Giver', temp_user)
			.resultList();
		},
		get_real_id: function(Q_ID){
			return DB.Questions.find()
			.equal('Q_ID', Q_ID)
			.singleResult()
			.then(function(result){
				return result.id;
			});
		},
		update_question: function(id, text){
			return DB.Questions.load(id).then(function(question){
				question.Q_Text = text;
				question.Edit_Date = new Date().getTime();
				return question.update();
			})
		},
		update_answer: function(id, text){
			return DB.Answers.load(id).then(function(answer){
				answer.A_Text = text;
				answer.Edit_Date = new Date().getTime(); 
				return answer.update();
			})
		}
	}
})();


var ProfileController= (function(){
	var q_template;
	var u_template;
	var a_template;

	var renderquestions = function(result) {
		$('#questions').html(q_template({questions : result}));
	};

	var renderuserinfo = function(result){
		$('#userinfo').html(u_template({users : result}));
	};

	var renderanswers = function(result){
		$('#answers').html(a_template({answers : result}));
	};

	var ctrl = {
		showQuestions: function(){
			ProfileService.userquestions().then(renderquestions);
		},
		showProfile: function(){
			ProfileService.user().then(renderuserinfo);
		},
		showAnswers: function(){
			ProfileService.answers().then(renderanswers);
		},
		updateQuestion: function(Q_ID, text){
			ProfileService.get_real_id(Q_ID).then(function(id){
				return ProfileService.update_question(id, text).then(function(){
					return ctrl.showQuestions();
				});
				});
			
		},
		updateAnswer: function(id, text){
			return ProfileService.update_answer(id, text).then(function(){
				return ctrl.showAnswers();
			});
		},
		onReady: function() {
			var source= $("#question_template").html();
			q_template = Handlebars.compile(source);
			var source2 = $("#user_template").html();
			u_template = Handlebars.compile(source2);
			var source3 = $("#answer_template").html();
			a_template = Handlebars.compile(source3);			
			if(ProfileService.isLoggedin()){
				ctrl.showProfile();
				ctrl.showQuestions();
				ctrl.showAnswers();
			}
			else{
				alert('not logged in, todo');
			}
		}
	};


	return ctrl;

})();



DB.ready(ProfileController.onReady);