var QuestionService= (function(){
  return{
    all: function(){
      return DB.Questions.find()
      .descending('Karma')
      .resultList();
    },
    count: function(){
      return DB.Questions.find()
      .count(); 
    },
    save: function(question){
      question.save();
    },
    get_real_id: function(Q_ID){
      return DB.Questions.find()
      .equal('Q_ID', Q_ID)
      .singleResult()
      .then(function(result){
        return result.id;
      });
    },
    karmaplus: function(id){
      return DB.Questions.load(id).then(function(question){
        question.Karma++;  
        return question.update();
      });
    },
    karmaminus:function(id){
      return DB.Questions.load(id).then(function(question){
        question.Karma-=1;
        return question.update();
      });
    },
  }
})();

var HashService = (function(){
  return{
    createHash: function(title, date){
      hash = title.concat(date.toString());
      return hash;
    },
  }
})();

var CounterService = (function(){
  return{
    get: function(){
      return DB.Counter.load("dbaf09c5-e40b-4189-ab80-5443d045df49").then(function(result){
        return result.Counter;
      });
    },
    increment: function(){
      return DB.Counter.load("dbaf09c5-e40b-4189-ab80-5443d045df49").then(function(result){
        result.Counter +=1;
        return result.update();
      });
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
      CounterService.get().then(function(count){
      alert(count);
      var temp_date = new Date().getTime();
      temp_hash = HashService.createHash(title,temp_date);
      var temp_question = new DB.Questions({
        Q_Asker : DB.User.me.username,
        Q_Title : title,
        Q_Text : question,
        Q_ID : count,
        Q_Date : temp_date,
        Karma : 0,
        Q_hash : temp_hash
      });
      QuestionService.save(temp_question);
      });
      CounterService.increment();
        alert('Question saved, thank you!');
      render();
    },

    karmaplus: function(q_id){
      QuestionService.get_real_id(q_id).then(function(id){
        QuestionService.karmaplus(id).then(function(){
          ctrl.showAll();
          NewsController.onReady();
        });
      })
    },
      karmaminus: function(q_id){
      QuestionService.get_real_id(q_id).then(function(id){
        QuestionService.karmaminus(id).then(function(){
          ctrl.showAll();
          NewsController.onReady();
        });
      })
      },
    
    onReady: function() {
      var source= $("#question_template").html();
      template = Handlebars.compile(source);
      ctrl.showAll();
    }
  };


  return ctrl;

})
();


DB.ready(QuestionController.onReady);
