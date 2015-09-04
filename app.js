//Let's connect to our Baqend
DB.connect("http://fuba.baqend.com");

var QuestionService= (function(){
  return{
    all: function(){
      return DB.Questions.find()
      .resultList();
    },
    count: function(){
      return DB.Questions.find()
      .count(); 
    },
    save: function(question){
      question.save();
    }
  }
})();





var QuestionController= (function() {
  var template;


  var render = function(result) {
    $('#questions').html(template({questions : result}));
  };

  var ctrl = {
    showAll: function() {

      QuestionService.all().then(render);
    },
    add: function(user,title, question){
      var temp_id = QuestionService.count + 1;
      var temp_date = new Date().getTime();
      var temp_question = new DB.Questions({
        Q_Asker : user,
        Q_Title : title,
        Q_Text : question,
        Q_ID : temp_id,
        Q_Date : temp_date
      });
      QuestionService.save(temp_question);
      render();

    },
    onReady: function() {
      var source= $("#question_template").html();
      template = Handlebars.compile(source);
      ctrl.showAll();
    }
  };
  return ctrl;

})();

DB.ready(QuestionController.onReady);
