const express = require('express');
const promotionRouter = express.Router(); // Create an Express router instance
const Promotion = require('../models/promotion'); // Import the Promotion model
const authenticate = require('../authenticate'); // Import authentication middleware

// Route for /promotions endpoint
promotionRouter.route('/')
  .get((req, res, next) => { //handle GET requests to fetch all promotions
    Promotion.find() //find all promos in the database
      .then(promotions => {
        res.statusCode = 200; //OK
        res.setHeader('Content-Type', 'application/json'); //set response content type
        res.json(promotions); //send promotions as JSON response
      })
      .catch(err => next(err)); //handle errors
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //handle POST requests (admin only)
    Promotion.create(req.body) //create a new promotion
      .then(promotion => {
        console.log('Promotion Created', promotion); //log the created promotion
        res.statusCode = 200; //OK
        res.setHeader('Content-Type', 'application/json'); // Set response content type
        res.json(promotion); //return the created promotion
      })
      .catch(err => next(err)); //handle errors
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //handle DELETE requests (admin only)
    Promotion.deleteMany() //delete all promotions
      .then(response => {
        res.statusCode = 200; //ok
        res.setHeader('Content-Type', 'application/json'); //set response content type
        res.json(response); //return the result of delete operation
      })
      .catch(err => next(err)); //handle errors
  });

//route for /promotions/promotionId
promotionRouter.route('/:promotionId')
  .get((req, res, next) => { //handle GET requests for a specific promotion by id
    Promotion.findById(req.params.promotionId) //find promotion by id
      .then(promotion => {
        res.statusCode = 200; //ok
        res.setHeader('Content-Type', 'application/json'); //set response content type
        res.json(promotion); //return the promotion
      })
      .catch(err => next(err)); //handle errors
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => { //post not allowed for specific promotion
    res.statusCode = 403; //forbidden status
    res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //admin only handle PUT requests to update promotion
    Promotion.findByIdAndUpdate(req.params.promotionId, { //find promotion by id & update
      $set: req.body //update promotion with request body
    }, { new: true }) //return the updated document
      .then(promotion => {
        res.statusCode = 200; //ok
        res.setHeader('Content-Type', 'application/json'); //set response content type
        res.json(promotion); //return the updated promotion
      })
      .catch(err => next(err)); //handle errors
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //handle delete requests for a specific promotion (admin only)
    Promotion.findByIdAndDelete(req.params.promotionId) //find promotion by id & delete
      .then(response => {
        res.statusCode = 200; //ok
        res.setHeader('Content-Type', 'application/json'); // Set response content type
        res.json(response); //return the result of delete operation
      })
      .catch(err => next(err)); //handle errors
  });

module.exports = promotionRouter; //export router

/*promotionRouter.route('/')
  .get((req, res, next) => {
    Promotion.find()
      .then(promotions => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      })
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body)
      .then(promotion => {
        console.log('promotion Created ', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
      })
      .catch(err => next(err));
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  })*/