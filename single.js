//Let's connect to our Baqend
DB.connect("http://fuba.baqend.com");

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
      .resultList();
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
    add: function(user, answer){
      var temp_user = user;
      var temp_text = answer;
      var query = parseInt(window.location.search.substring(1));
      var temp_id = SingleService.count() + 101;
      var temp_date = new Date().getTime();
      var temp_answer = new DB.Answers({
        A_ID : temp_id,
        Q_ID : query,
        A_Giver : user,
        A_Date : temp_date,
        A_Text : temp_text
      });
      SingleService.save(temp_answer);
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
