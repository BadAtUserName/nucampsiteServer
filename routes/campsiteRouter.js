const express = require('express');
const Campsite = require('../models/campsite');//import campsite model
const campsiteRouter = express.Router();//create instance of router
const authenticate = require('../authenticate');//import auth middleware

//Handle requests to /campsites endpoint
campsiteRouter.route('/')
    .get((req, res, next) => { //handle get requests 
        Campsite.find()
            .populate('comments.author')// populate author field in comments
            .then(campsites => {
                res.statusCode = 200;//OK
                res.setHeader('Content-Type', 'application/json');//set header response
                res.json(campsites);//send campsites to json
            })
            .catch(err => next(err));//handle errors
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//handle post requests admin only
        Campsite.create(req.body)//create new campsite
            .then(campsite => {
                console.log('Campsite Created ', campsite);//log new campsite
                res.statusCode = 200;//OK
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);//return created campsite
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => { //put not allowed
        res.statusCode = 403;//no thank you its forbidden
        res.end('PUT operation not supported on /campsites');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.deleteMany()// delete all campsites
            .then(response => {
                res.statusCode = 200;//OK
                res.setHeader('Content-Type', 'application/json');
                res.json(response);//return delete operation result
            })
            .catch(err => next(err));
    });
//Handle request to /campsites/campsiteId
campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => { //handle get for spec campsite
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')//poulate comments
            .then(campsite => {
                res.statusCode = 200;//OK
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);//Return spec comments
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {//post not allowed 4 spec campsite
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//handle put request to update campsite
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true }) //return the updated document
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);//return updated campsite
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//handle delte for spec campsite
        Campsite.findByIdAndDelete(req.params.campsiteId)//delete spec campsite
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);//return delte result
            })
            .catch(err => next(err));
    });
//Handle request for spec comments
campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {//get spec comments
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);//return spec comments
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//post a comment (user authenticated)
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    req.body.author = req.user._id;//assign author
                    campsite.comments.push(req.body)//add comment
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);//return updated campsite
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {//not allowed on comments
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//delte all comments admin only
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).deleteOne();//delete on comment
                    }
                    campsite.save()//save changes
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);//return updated campsite
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });
//Handle request for spec comments on campsite
campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {//get spec comment
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));//Return spec comment
                } else if (!campsite) {
                    //campsite not found
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    //comment not found
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {//post not allowed on spec comment
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {//PUT to update spec comment
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            
            if (campsite && campsite.comments.id(req.params.commentId)) {
                const comment = campsite.comments.id(req.params.commentId);
                
                // Check if the logged-in user is the author of the comment
                if (comment.author.equals(req.user._id)) {
                    // User is the author, proceed to update
                    if (req.body.rating) {
                        comment.rating = req.body.rating;
                    }
                    if (req.body.text) {
                        comment.text = req.body.text;
                    }
                    campsite.save()
                        .then(campsite => {
                            // Successfully updated comment
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    // User is not the author, return 403 Forbidden
                    const err = new Error('You are not authorized to update this comment!');
                    err.status = 403;
                    return next(err);
                }
            } else if (!campsite) {
                // Campsite not found
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                // Comment not found
                const err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
})

.delete(authenticate.verifyUser, (req, res, next) => {
    // Removed authenticate.verifyAdmin to allow users to delete their own comments
    Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                const comment = campsite.comments.id(req.params.commentId);

                // Check if the logged-in user is the author of the comment
                if (comment.author.equals(req.user._id)) {
                    // User is the author, proceed to delete
                    comment.remove(); // Remove the comment
                    campsite.save()
                        .then(campsite => {
                            // Successfully deleted comment
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    // User is not the author, return 403 Forbidden
                    const err = new Error('You are not authorized to delete this comment!');
                    err.status = 403;
                    return next(err);
                }
            } else if (!campsite) {
                // Campsite not found
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                // Comment not found
                const err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
});

module.exports = campsiteRouter;

/*const express = require('express');
const campsiteRouter = express.Router();

campsiteRouter.route('/')//¯\_(ツ)_/¯ anyone else feel like it has this vibe?
.all((req,res,next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})

.get((req,res) => {
  res.end('Will send all the campsites to you');
})
.post((req,res) => {
  res.end(`Will add the campsite: ${req.body.name} with description: ${req.body.description}`);
})
.put((req,res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /campsites');
})
.delete((req, res) => {
  res.end('Deleting all campsites');
});

// New route for '/:campsiteId'
campsiteRouter.route('/:campsiteId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end(`Will send details of the campsite with ID: ${req.params.campsiteId} to you`);
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put((req, res) => {
  res.end(`Updating the campsite with ID: ${req.params.campsiteId} 
    with name: ${req.body.name} and description: ${req.body.description}`);
})
.delete((req, res) => {
  res.end(`Deleting campsite with ID: ${req.params.campsiteId}`);
});

module.exports = campsiteRouter;*/