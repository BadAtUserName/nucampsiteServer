const express = require('express');
const partnerRouter = express.Router();//creat instance of express router
const authenticate = require('../authenticate');//import middleware
const Partner = require('../models/partner')//import partner model
const cors = require('./cors');


//Handle request to partners
partnerRouter.route('/')
// Handle pre-flight requests for CORS
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors,(req, res, next) => {//handle get requests
    partner.find()//find all partner
      .then(partners => {
        res.statusCode = 200;//OK
        res.setHeader('Content-Type', 'application/json');
        res.json(partners);//return partners to json
      })
      .catch(err => next(err));//handle errors
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {//admin only handle post
    Partner.create(req.body)//create new partner
      .then(partner => {
        console.log('Partner Created ', partner);//log new partner
        res.statusCode = 200;//ok
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);//return partner createdjson
      })
      .catch(err => next(err));//handle errors
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {//put not allowed
    res.statusCode = 403;//cant do it, it's forbidden
    res.end('PUT operation not supported on /partners');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Partner.deleteMany()//delete all partners
      .then(response => {
        res.statusCode = 200;//ok status
        res.setHeader('Content-Type', 'application/json');
        res.json(response);//return delete operation result
      })
      .catch(err => next(err));//handle errors
  });

//handle requests to /partners/partnerID
partnerRouter.route('/:partnerId')
// Handle pre-flight requests for CORS
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors,(req, res, next) => {//handle request spec partner
    Partner.findById(req.params.partnerId)//find partner by ID
      .then(partner => {
        res.statusCode = 200;//ok
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);//return partner details
      })
      .catch(err => next(err));//catch errors
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {//post not allowed spec partner
    res.statusCode = 403;//forbidden
    res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
  })
  .put(authenticate.verifyUser, (req, res, next) => {//handle put request to update partner
    Partner.findByIdAndUpdate(req.params.partnerId, {//find partner by id and update
      $set: req.body//Update partner details with request body
    }, { new: true })//Return updated partner
      .then(partner => {
        res.statusCode = 200;//OK status
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);//return updated partner details
      })
      .catch(err => next(err));//Handle errors
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {// Handle DELETE requests for specific partner (admin only)
    Partner.findByIdAndDelete(req.params.partnerId)//find partner by id and delete
      .then(response => {
        res.statusCode = 200;//ok
        res.setHeader('Content-Type', 'application/json');
        res.json(response);//Return delete operation results
      })
      .catch(err => next(err));//handle errors
  });

module.exports = partnerRouter;