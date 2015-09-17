/*

As this is the main-js-file, generic functions (like render and onReady) are only explained once - here - and not on every other .js-file they are in.

The QuestionService is primary responsible for fetching all the questions from the database to the Landing-Page
The Functions in detail :

  "all" : Gets all Questions from the database
  "count" : Gets the number of all Questions
  "save" : just saves a question. 
  "get_real_id" : As we are working with Q_ID for identifying our Questions, we need this function to get the id from a given Q_ID, to then use the id in the load-process.
  "karmaplus" : Pretty self-explanatory, this just increments the karma of a given question.
  "karmaminus" : Same thing, just for decrementing.
  "votedusers" : As every User may only vote once, this returns an array of all users who already voted for this question from the Questions-database.
  "addvoteduser" : Every time a user succesfully votes this function is called, adding his username to the array of votedusers.
  "initvoteduser" : When the Array of votedusers is empty, the add-function in addvoteduser doesn't work, so this is for initializing the array.
*/

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
The CounterService is responsible for getting correct new Q_ID's from our Counter-Database, both Counters are just implemented as simple Data with an Integer counting on 
for every new Question entered. First the "get" is used to get the current counter, and afterwards it's incremented by - what a surprise - the "increment"-function.
As the Counter is always the same we can easily just get it with the hardcoded id of the counter.


*/

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

/*
The QuestionController takes care of adding new Questions and inhibits the functionality of the karma-functions.
In Detail :
  "render" : typical, just renders the template on index.html which is responsible for displaying all Questions (to be precise : it really only takes care of the "All Questions"-Section, the "New Questions"-Section is handled by another js, namely news.js)
  "showAll" : this is just the function taking care of binding QuestionService to the render-function, such that the render function can take the result from the QuestionService.all-Function to display it in the way the html-handlebars-template defines it.  
  "add" : This function takes care of adding new Questions to the Database and uses the CounterService to get the correct Q_ID and increment the counter, as well as the QuestionService to save the new Question.
  "karmaplus" : This looks a bit bloated, which is due to the few possibilities while voting for a question - more on this in the Praktikumsbericht. Essentially this is responsible for the process between "A user clicks on the Vote-Up-Arrow" and the Refreshing of the Karma-Number on the homepage.
  "karmaminus" : The Equivalent to karmaplus for voting down.
  "onReady" : Just as render, this function we use in every single .js to be executed on pageload and get the system going.


*/



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
        var temp_date = new Date().getTime();
        var temp_question = new DB.Questions({
          Q_Asker : DB.User.me.username,
          Q_Title : title,
          Q_Text : question,
          Q_ID : count,
          Q_Date : temp_date,
          Karma : 0,
        });
        QuestionService.save(temp_question);
      });
      CounterService.increment();
      alert('Question saved, thank you!');
      render();
    },

    karmaplus: function(q_id){
      if(QuestionService.isLoggedin()){
      QuestionService.get_real_id(q_id).then(function(id){
        QuestionService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each question!');
            else{
              QuestionService.get_real_id(q_id).then(function(id){
                QuestionService.karmaplus(id).then(function(){
                  QuestionService.addvoteduser(id);
                  ctrl.showAll();
                  NewsController.onReady();
                });
              });
            }
          }
          else{
            QuestionService.initvoteduser(id);
            QuestionService.get_real_id(q_id).then(function(id){
              QuestionService.karmaplus(id).then(function(){
                ctrl.showAll();
                NewsController.onReady();
              });
            });
          }
        });
      });
  }
  else alert('Sorry. You need to be logged in to vote!');
    },
    karmaminus: function(q_id){
            if(QuestionService.isLoggedin()){
      QuestionService.get_real_id(q_id).then(function(id){
        QuestionService.votedusers(id).then(function(result){
          if(result != null){
            if(result.has(DB.User.me.username))
              alert('Sorry, you cant vote more than once for each question!');
            else{
              alert('42');
              QuestionService.get_real_id(q_id).then(function(id){
                QuestionService.karmaminus(id).then(function(){
                  QuestionService.addvoteduser(id);
                  ctrl.showAll();
                  NewsController.onReady();
                });
              });
            }
          }
          else{
            QuestionService.initvoteduser(id);
            QuestionService.get_real_id(q_id).then(function(id){
              QuestionService.karmaminus(id).then(function(){
                ctrl.showAll();
                NewsController.onReady();
              });
            });
          }
        });

      });
    }
    else alert('Sorry. You need to be logged in to vote!');
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
