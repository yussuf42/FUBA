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