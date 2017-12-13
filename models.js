'use strict'
//MOOVED FROM q-a-rest-api!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const mongoose = require('mongoose');

const Schema = mongoose.Schema

const sortAnswers = (a, b) => {
  //negative if a before b
  //0 to leave order unchanged
  //positive if a after b
   if(a.votes === b.votes) {       
       return b.updatedAt - a.updatedAt; // milliseconds since 1970
   }
   return b.votes - a.votes;
}

const AnswerSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
});

//instance method
//AnswerSchema.methods.update = (updates, callback) => {}
//alternative way to write instance method
AnswerSchema.method("update", function (updates, callback) {
    Object.assign(this, updates, {updatedAt: new Date()});
    this.parent().save(callback);
});


//im2

AnswerSchema.method("vote", function(vote, callback) {
    if(vote === "up"){
        this.votes += 1;
    }else{
        this.votes -= 1;
     }
    this.parent().save(callback);
  });

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    answers: [AnswerSchema]
});

QuestionSchema.pre('save', function(next){
  this.answers.sort(sortAnswers); //we customized sort method above with sortAnswers
  next();
})

const Question = mongoose.model("Question", QuestionSchema);

module.exports.Question =Question;

//Can a JavaScript browser-application in one domain RESTfully access resources from another? yes if api has proper headers
//
//GET REQUEST OOO = Order of processes... router, route handler, database query, response returned to client