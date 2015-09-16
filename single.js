var SingleService= (function(){
  return{
    show: function(query){
      return DB.Questions.find()
      .equal('Q_ID', query)
      .resultList();
    },
    showAnswers: function(query){
      return DB.Answers.find()
      .equal('Q_ID', query)
      .descending('Karma')
      .resultList()
    },
    count: function(){
      return DB.Answers.find()
      .count();      
    },
    save: function(answer){
      answer.save();
    }
  }
})();



var SingleController= (function() {
  var template;
  var render = function(result) {
    $('#single').html(template({single : result}));
  };

  var ctrl = {
    show: function(query) {
      SingleService.show(query).then(render);
    },
    onReady: function() {
      var source= $("#single_template").html();
      template = Handlebars.compile(source);
      var query = parseInt(window.location.search.substring(1));
      ctrl.show(query);
    }
  };
  return ctrl;

})();



var AnswerController = (function(){
  var template;
  var render = function(result) {
    $('#answers').html(template({answers : result}));
  };

  var ctrl = {
    show: function(query){
      SingleService.showAnswers(query).then(render);
    },
    add: function(answer, title){
      SingleService.count().then(function(count){
      var temp_user = DB.User.me.username;
      var temp_text = answer;
      var query = parseInt(window.location.search.substring(1));
      SingleService.count().then(function(count){
        count += 101;
      var temp_date = new Date().getTime();
      var temp_answer = new DB.Answers({
        A_ID : count,
        Q_ID : query,
        A_Giver : temp_user,
        A_Date : temp_date,
        A_Text : temp_text,
        Q_Title : title,
        Karma : 0
      });
      SingleService.save(temp_answer);
      });

      });
      alert("Thank you, Answer saved!")
    },
    onReady: function(){
      var source= $("#answer_template").html();
      template = Handlebars.compile(source);
      var query = parseInt(window.location.search.substring(1));
      ctrl.show(query);
    }
  };
  return ctrl;

})();



DB.ready(SingleController.onReady);
DB.ready(AnswerController.onReady);
