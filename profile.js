/*
	profile.js is responsible for the /profile-page which is only containing useful information if the user logged in.
	ProfileService takes care of all Database-related tasks, in detail :
	"isLoggedin" : Common function, used for checking if the user is logged in.
	"userquestions" : This function fetches all questions posted by the logged in user.
	"user" : this just returns all Info from the User-Database for the logged in user, this was mostly thought to later get more information like an avatar or a personal-bio or other personal stuff. As we didn't get to implement this, it could've been done easier - but for further expanding the webapp it's useful.
	"answers" : This fetches all Answers given by the logged in user.
	"get_real_id" : common function to get the id from a given Q_ID to be used in a load-command.
	"update_question" : As the user is able to edit his questions and answers, we need DB-Write-Commands to update them, this one's for updating the Question.
	"update_answer" : Equivalent to update_question, this is used to update an existing answer. 
*/
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

/*
	The ProfileController is the one responsible for all three scripts on profile.html, in detail:
	"renderquestions" is rendering the questions previously fetched by ProfileService.userquestions and both are wrapped in "ctrl.showQuestions"
	"renderuserinfo" is rendering the personal data fetched by ProfileService.user and both are wrapped in "ctrl.showProfile"
	"renderanswers" is rendering the answers previously fetched by ProfileService.answers and both are wrapped in "ctrl.showAnswers"
	"updateQuestion" is using promises to first get the id from the given Q_ID of the updated question, then updating it with the new text and rendering the question-section again, with the updated question.
	"updateAnswer" is the equivalent of updateQuestion for dealing with updated answers.
	"onReady" is a bit bigger here, used for rendering all three scripts and checking whether the user is logged in. If he isn't a Popup shows, telling the user to login first before visiting this page (which isnt linked anywhere if not logged in anyway, so normally he shouldn't get here anyway.)
*/
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
				alert('You are not logged in, this page cant contain any useful information right now, please go back to the landing page, login and come back. You can use the headline, which is a link to the landingpage.');
			}
		}
	};


	return ctrl;

})();



DB.ready(ProfileController.onReady);