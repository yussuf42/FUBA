/*
  single.js gets only loaded at /SingleQuestion.html.
  SingleService takes care of DB-Access, en detail :
  "show" just fetches the Question with the correct Q_ID from the Database. A resultList is used instead of a singleResult because it's convenient.
  "showAnswers" fetches all Answers with the correct Q_ID, that is all Answers answering the previously loaded Question.
  "count" is legacy, it counts all Answers but isn't used anywhere. However, to further develop the WebApp it can be useful which is why it's still there.
  "save" just saves an answer to the Database.
  "get_real_id" I think I explained twice, just look in app.js 
  "karmaplus" increments the Karma-Value of a given Question 
  "karmaminus" decrements the very same value.
  "votedusers" gets the users who already voted for the loaded Question (to be precise it gets the "voted_users"-Array from the Question with the given id).
  "addvoteduser" adds the current user to the "voted_users"-Array so that he can't vote another time.
  "initvoteduser" is used when said "voted_users"-Array is empty, initializes it and adds the current user to it.
  */
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


/*
  The CounterService can fetch and/or increment the A_ID-Counter. We need this to ensure that every single Answer has a unique, consecutive Id.
  */
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

/*
  The AnswerService is responsible for the DB-Access concerning the Answers. In Detail :
  "karmaplus" increments the Karma-Value of a given Answer which is loaded via its id (that is, "id", not "A_ID").
  "karmaminus" is the equivalent for decrementing.
  "get_real_id" gets the "id" of an answer by a given "A_ID".
  "votedusers" gets the Array which holds the usernames of all users who already voted for the specific answer.
  "addvoteduser" adds the current user to the "voted_users"-Array of a specific answer.
  "initvoteduser" initializes said array if it is null before.
  */
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

/*
  SingleController takes care of rendering the Section where the Question is shown, all functions are pretty generic and self-explanatory.
  */
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

/*
  The AnswerController is responsible for displaying the Answers-Section. It combines the Database-Access from the Service with the html-template and adds some logic.
  In Detail :
    "render", "show" and "add" are explained in different locations, so I won't go further into them.
    "karmaplus" and "karmaminus" are explained in app.js, further documentation can be found in the Praktikumsbericht.
    "a_karmaplus" and "a_karmaminus" are equivalent, but taking care of the answers instead of the questions.
*/

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
