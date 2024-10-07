const express = require('express');
const promotionRouter = express.Router();

promotionRouter.route('/')//¯\_(ツ)_/¯ anyone else feel like it has this vibe?
.all((req,res,next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})

.get((req,res) => {
  res.end('Will send all the promotions to you');
})
.post((req,res) => {
  res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`);
})
.put((req,res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /promotions');
})
.delete((req, res) => {
  res.end('Deleting all promotions');
});

// New route for '/:promotionId'
promotionRouter.route('/:promotionId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end(`Will send details of the promotion with ID: ${req.params.promotionId} to you`);
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /promotions/${req.params.promotionId}`);
})
.put((req, res) => {
  res.end(`Updating the promotion with ID: ${req.params.promotionId} 
    with name: ${req.body.name} and description: ${req.body.description}`);
})
.delete((req, res) => {
  res.end(`Deleting promotion with ID: ${req.params.promotionId}`);
});

module.exports = promotionRouter;