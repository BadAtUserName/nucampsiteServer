const express = require('express');
const partnerRouter = express.Router();

partnerRouter.route('/')//¯\_(ツ)_/¯ anyone else feel like it has this vibe?
.all((req,res,next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})

.get((req,res) => {
  res.end('Will send all the partners to you');
})
.post((req,res) => {
  res.end(`Will add the partner: ${req.body.name} with description: ${req.body.description}`);
})
.put((req,res) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /partners');
})
.delete((req, res) => {
  res.end('Deleting all partners');
});

// New route for '/:partnerId'
partnerRouter.route('/:partnerId')
.all((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  next();
})
.get((req, res) => {
  res.end(`Will send details of the partner with ID: ${req.params.partnerId} to you`);
})
.post((req, res) => {
  res.statusCode = 403;
  res.end(`POST operation not supported on /partner/${req.params.partnerId}`);
})
.put((req, res) => {
  res.end(`Updating the partner with ID: ${req.params.partnerId} 
    with name: ${req.body.name} and description: ${req.body.description}`);
})
.delete((req, res) => {
  res.end(`Deleting partner with ID: ${req.params.partnerId}`);
});

module.exports = partnerRouter;