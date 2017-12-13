'use strict'
//MOVED FROM qa-rest-api!!!!!!!!==================================================
//To get all documents from a collection with Mongoose, we can pass AN EMPTY OBJ LITERAL to the first parameter of the find query.
//What is a reusable way to provide a document to routes containing its ID in a URL parameter? PARAM METHOD PROVIDED BY EXPRESS `ROUTeR` OBJ
//What needs to be done to a mongoose result to convert it to JSON so it can be passed into the response object's `json` method? NOTHING
//What happens if a callback is not passed to a Mongoose model's find method? MONGOOSE DOESNT EXECUTE QUERY IMMEDIATELY and RETURNS a QUERY BUILDER
//What method executes a Mongoose query builder?  EXEC
const express = require ('express');
const router = express.Router();
const Question = require("./models").Question;

//return all question documents
router.param("qID", function (req, res, next, id) { //callback gets executed when qid is present
    Question.findById(id, function(err, doc){
        if (err) return next(err);
        if(!doc) {
          err = new Error("Not Found");
          err.status = 404;
          return next(err);
        }
        req.question = doc; //if it exists lets set it on the request object si it can be used by other middleware and route handlers that receive this req
        return next(err);
    });
});

router.param("aID", function (req, res, next, id) {
    req.answer = req.question.answers.id(id);
    if(!req.answer) {  //if answer cant be found
          err = new Error("Not Found");
          err.status = 404;
          return next(err);
        }
      next(); //otherwise call next to pass control back to router
});


//GET /questions
 //Route for questions collection
 //this method doesnt execute the query immediately, and uses a query builder to modify the query
router.get("/", (req, res, next) => {
    Question.find({})
             .sort({createdAt: -1}) // sorted in descending order AND query hasnt beeen executed yet!
             .exec(function(err, questions){ //executes query, calls callback
                  if(err) return next(err);    
                  res.json(questions); // if there are no errors we cans send the results to the client's request
              });
});
//alternate way to make get request
// router.get("/", (req, res, next) => {
//     Question.find({}, null, {sort: {createdAt: -1}}, function(err, questions){      
//         if(err) return next(err);    
//         res.json(questions); // if there 
//     });
// });

//POST /questions
 //Reoute for creating questions
router.post("/", (req, res, next) => {
    const question = new Question(req.body);
    question.save(function(err, question){
        if (err) return next(err);
        res.status(201); //indicated doc saved successfully
        res.json(question);//send out document to client
    });
});

//GET /questions
//route for specific questions
router.get("/:qID", (req, res, next) => {
    //put in router.param method at top of page
    res.json(req.question);
}); 

//POST /questions/:id/answers
 //Reoute for creating an answer
router.post("/:qID/answers", (req, res, next) => {
  req.question.answers.push(req.body);
  req.question.save(function(err, question){
        if (err) return next(err);
        res.status(201);
        res.json(question);//send response back to client
    });
});


//PUT /questions/:id/answers/:aID
 //Edit a specific answer answer
router.put("/:qID/answers/:aID", (req, res) => {
    req.answer.update(req.body, function(err, result){ //CALLBACK FIRES AFTER saving updates to database
        if (err) return next(err);
        res.json(result);
    });  
});

//DELETE /questions/:id/answers/:aID
 //Delete a specific answer answer
router.delete("/:qID/answers/:aID", (req, res) => {
    req.answer.remove(function(err) {
        req.question.save(function(err, question) { //in callback save parent question
            if (err) return next(err);
            res.json(question);
        });
    }); 
});

//POST /questions/:id/answers/:aID/vote-up
 //POST /questions/:id/answers/:aID/vote-down
 //Vote on a specific answer
router.post("/:qID/answers/:aID/vote-:dir", 
     (req, res, next) => {
        if(req.params.dir.search(/^(up|down)$/) === -1) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err)
        } else {
            req.vote = req.params.dir;
            next();
        }
},  (req, res, next) => {
        req.answer.vote(req.vote, function(err, question){
            if (err) return next(err);
            res.json(question);
      });
});

//Get /questions/5/answers
// router.get("/5/answers")
module.exports = router;