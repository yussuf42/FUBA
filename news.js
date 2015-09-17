/*
	news.js takes care of the New-Question-Section on the landing page.
	NewsService has only got one function which is fetching the latest 5 Questions.
	This is done via the Q_ID. Because we implemented the Q_ID to be consecutive the 5 Questions with the highest Q_ID's are the ones posted latest.
*/
var NewsService = (function(){
	return{
		news:function(){
			return DB.Questions.find()
			.descending('Q_ID')
			.limit(5)
			.resultList();

		}
	};
})();


/*
	The NewsController takes care of filling the html-handlebars-template with Data from the Database, it's "show"-function is called on pageload, to use the NewsService to get the questions and then render to display them. 
*/
var NewsController = (function(){
	var template;

	var render = function(result){
		$('#news').html(template({news: result}));
	};

	var ctrl = {
		show: function(){
			NewsService.news().then(render);
		},
		onReady: function(){
			var source = $('#news_template').html();
			template = Handlebars.compile(source);
			ctrl.show();
		}
	};
		return ctrl;
})();

DB.ready(NewsController.onReady);