/**
 * File: trainerRouter.js
 * Purpose: responsible for handling trainer routes 
 */
const express = require('express');
const crud = require('../data/crud');
const router = express.Router();
const db = require('../data/db');

router.route('/')
.get((req, res) => {
  res.redirect('/trainerHome');
});

router.route('/availability')
.post(async(req, res) => {
  console.log(req.body);
  let {date, start, end} = req.body;
  let dateFormat = new Date(date);
  dateFormat = dateFormat.toISOString().split('T')[0];

  let id = req.session.user.id;
  let query = await db.query(crud.INSERT_TRAINER_AVAILABILITY, [id, dateFormat, start, end]);
  console.log(query)
  if(query.rowCount > 0){
    return res.redirect('/trainerHome');
  } 
  res.status(401).send('Could not update availability');
})
.get(async(req, res) => { //delete availaibilty
  let {date} = req.query;
  let dateFormat = new Date(date);
  let id = req.session.user.id;
  dateFormat = dateFormat.toISOString().split('T')[0];
 
  let query = await db.query(crud.DELETE_TRAINER_AVAILABILITY, [id, dateFormat]);
  if(query.rowCount){
    res.redirect('/trainerHome');
  }else{
    res.status(401).send('Could not delete availability');
  }
})


module.exports = router;