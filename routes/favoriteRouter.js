const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');//import auth middleware
const Favorite = require('../models/favorite');//import favorite model

const favoriteRouter = express.Router();

//Handle requests to /campsites endpoint
favoriteRouterRouter.route('/')
  // Handle pre-flight requests for CORS
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => { //handle get requests 
    Favorite.find({ user: req.user._id })
      .populate('user')// populate user field 
      .populate('campsites')// Populate the campsites field with campsite details
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({
          message: 'Here are your favorites!',
          httpCat: 'https://http.cat/200',
          favorite
        }); // Send the favorite document as a JSON response
      })
      .catch(err => next(err)); // Pass errors to the error handler
  })
  // POST new campsites to the favorites list
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          //Add new campsites to the list if they are not already present
          req.body.forEach(campsite => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite.save()
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                message: 'Campsites added to your favorites!',
                httpCat: 'https://http.cat/200',
                favorite
              }); // Send the updated favorite document
            })
            .catch(err => next(err));
        } else {
          //Create a new favorite document
          Favorite.create({ user: req.user._id, campsites: req.body.map(campsite => campsite._id) })
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                message: 'Favorite document created!',
                httpCat: 'https://http.cat/200',
                favorite
              }); // Send the new favorite document
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));// Pass errors to the error handler
  })
  // PUT operation is not supported on '/favorites'
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported ')

  })
  // DELETE all favorites for the current user
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({
            message: 'Your favorites have been deleted.',
            httpCat: 'https://http.cat/200',
            favorite
          }); // Send the deleted favorite document
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You do not have any favorites to delete.');
        }
      })
      .catch(err => next(err));// Pass errors to the error handler
  });
// Set up routes for '/favorites/:campsiteId'
favoriteRouter.route('/:campsiteId')
  // Handle preflight requests
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  // GET operation is not supported on '/favorites/:campsiteId'
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/:campsiteId');
  })
  // POST a campsite to the favorites list

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          // Check if the campsite is already in the favorites list
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
            favorite.save()
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                  message: 'Campsite added to your favorites!',
                  httpCat: 'https://http.cat/200',
                  favorite
                }); // Send the updated favorite document
              })
              .catch(err => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is already in the list of favorites! https://http.cat/200');
          }
        } else {
          // Create a new favorite document if none exists
          Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
            .then(favorite => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({
                message: 'Favorite document created with the campsite!',
                httpCat: 'https://http.cat/200',
                favorite
              }); // Send the new favorite document
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err)); // Pass errors to the error handler
  })
  // PUT operation is not supported on '/favorites/:campsiteId'
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/:campsiteId');
  })
  // DELETE a campsite from the favorites list
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite) {
          const index = favorite.campsites.indexOf(req.params.campsiteId);
          if (index >= 0) {
            // Remove the campsite from the list
            favorite.campsites.splice(index, 1);
            favorite.save()
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                  message: 'Campsite removed from your favorites.',
                  httpCat: 'https://http.cat/200',
                  favorite
                }); // Send the updated favorite document
              })
              .catch(err => next(err));
          } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('That campsite is not in your list of favorites. https://http.cat/200');
          }
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('There are no favorites to delete. https://http.cat/200');
        }
      })
      .catch(err => next(err)); // Pass errors to the error handler
  });

// Export the favoriteRouter
module.exports = favoriteRouter;