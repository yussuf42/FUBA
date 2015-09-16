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
        votedusers: function(id){
      return DB.Questions.load(id).then(function(question){
        return question.voted_users;
      });
    },
    addvoteduser: function(id){
      return DB.Questions.load(id).then(function(question){
        question.voted_users.add(DB.User.me.username);
        question.update();
      });
    },
    initvoteduser: function(id){
      return DB.Questions.load(id).then(function(question){
        question.voted_users = new DB.Set([DB.User.me.username]);
        question.update();
      });      
    }
  }
})();


var CounterService = (function(){
  return{
    get: function(){
      return DB.Counter.load("f9c5284f-070e-4c51-a792-d92632264bd3").then(function(result){
        return result.Counter;
      });
    },
    increment: function(){
      return DB.Counter.load("f9c5284f-070e-4c51-a792-d92632264bd3").then(function(result){
        result.Counter +=1;
        return result.update();
      });
    }
  }
})();

var AnswerService = (function(){
  return{
    karmaplus: function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.Karma++;  
        return answer.update();
      });
    },
    karmaminus: function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.Karma--;  
        return answer.update();
      });
    },
    get_real_id: function(A_ID){
      return DB.Answers.find()
      .equal('A_ID', A_ID)
      .singleResult()
      .then(function(result){
        return result.id;
      });
    },
    karmaplus: function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.Karma++;  
        return answer.update();
      });
    },
    karmaminus:function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.Karma-=1;
        return answer.update();
      });
    },
        votedusers: function(id){
      return DB.Answers.load(id).then(function(answer){
        return answer.voted_users;
      });
    },
    addvoteduser: function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.voted_users.add(DB.User.me.username);
        answer.update();
      });
    },
    initvoteduser: function(id){
      return DB.Answers.load(id).then(function(answer){
        answer.voted_users = new DB.Set([DB.User.me.username]);
        answer.update();
      });      
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
      CounterService.get().then(function(count){
        var temp_user = DB.User.me.username;
        var temp_text = answer;
        var query = parseInt(window.location.search.substring(1));
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
      CounterService.increment();
      alert("Thank you, Answer saved!")
    },
    karmaplus: function(q_id){
      SingleService.get_real_id(q_id).then(function(id){
        SingleService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each question!');
            else{
              SingleService.get_real_id(q_id).then(function(id){
                SingleService.karmaplus(id).then(function(){
                  SingleService.addvoteduser(id);
                  var query = parseInt(window.location.search.substring(1));
                  SingleController.show(query);
                });
              });
            }
          }
          else{
            SingleService.initvoteduser(id);
            SingleService.get_real_id(q_id).then(function(id){
              SingleService.karmaplus(id).then(function(){
                var query = parseInt(window.location.search.substring(1));
                SingleController.show(query);
              });
            });
          }
        });
      });
    },
    karmaminus: function(q_id){
      SingleService.get_real_id(q_id).then(function(id){
        SingleService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each question!');
            else{
              SingleService.get_real_id(q_id).then(function(id){
                SingleService.karmaminus(id).then(function(){
                  SingleService.addvoteduser(id);
                  var query = parseInt(window.location.search.substring(1));
                  SingleController.show(query);
                });
              });
            }
          }
          else{
            SingleService.initvoteduser(id);
            SingleService.get_real_id(q_id).then(function(id){
              SingleService.karmaminus(id).then(function(){
                var query = parseInt(window.location.search.substring(1));
                SingleController.show(query);
              });
            });
          }
        });

      });
    }, 
    a_karmaplus: function(a_id){
      AnswerService.get_real_id(a_id).then(function(id){
        AnswerService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each answer');
            else{
              AnswerService.karmaplus(id).then(function(){
                AnswerService.addvoteduser(id);
                var query = parseInt(window.location.search.substring(1));
                ctrl.show(query);
              });
            }
          }
          else{
            AnswerService.initvoteduser(id);
            AnswerService.get_real_id(a_id).then(function(id){
              AnswerService.karmaplus(id).then(function(){
                var query = parseInt(window.location.search.substring(1));
                ctrl.show(query);
              })
            })
          }
        })
      })
    },
    a_karmaminus: function(a_id){
      AnswerService.get_real_id(a_id).then(function(id){
        AnswerService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each answer');
            else{
              AnswerService.karmaminus(id).then(function(){
                AnswerService.addvoteduser(id);
                var query = parseInt(window.location.search.substring(1));
                ctrl.show(query);
              });
            }
          }
          else{
            AnswerService.initvoteduser(id);
            AnswerService.get_real_id(a_id).then(function(id){
              AnswerService.karmaminus(id).then(function(){
                var query = parseInt(window.location.search.substring(1));
                ctrl.show(query);
              })
            })
          }
        })
      })
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
