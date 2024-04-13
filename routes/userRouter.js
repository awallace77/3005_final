/**
 * File: userRouter.js
 * Purpose: responsible for handling user routes (e.g., creating new exercise)
 */
const express = require('express');
const crud = require('../data/crud');
const router = express.Router();
const db = require('../data/db');
const { formatDate } = require('../utilities/utilities');
const { PERSONAL_TRAINING_PRICE } = require('../utilities/definitions');

router.route('/exercise')
.post(async(req, res) => {
  const {name, description, duration, date } = req.body;
  const id = req.session.user.id;

  // CREATE_MEMBER_ROUTINE: `INSERT INTO ${MEMBER_ROUTINE_TABLE} (member_id, name, description, duration) VALUES ($1, $2, $3, $4) RETURNING *;`,
  let query = await db.query(crud.CREATE_MEMBER_ROUTINE, [id, name, description, duration, date ? date : new Date()]);
  if(query.rowCount > 0){
    res.redirect('/home');
  }else{
    res.status(500).send('There was an error creating your exercise')
  }
})

router.route('/email')
.post(async(req, res) => {

  const {email} = req.body;

  let query = await db.query(crud.GET_USER_BY_EMAIL, [req.session.user.email]); // get user

  if(query.rowCount <= 0){ //error findiing the user
    res.status(500).send('There was an error updating your email');
    return;
  }

  if(query.rows[0].role === 'member'){
    query = await db.query(crud.UPDATE_MEMBER_EMAIL, [email, query.rows[0].email]); //update email 
  }else if(query.rows[0].role === 'trainer'){
    query = await db.query(crud.UPDATE_TRAINER_EMAIL, [email, query.rows[0].email]); //update email 
  }else{
    query = await db.query(crud.UPDATE_ADMIN_EMAIL, [email, query.rows[0].email]); //update email 
  }
  if(query.rowCount <= 0){
    res.status(500).send('There was an error updating your email');
    return;
  }

  req.session.user.email = query.rows[0].email;
  res.redirect('/home');
  return;
});

router.route('/password')
.post(async(req, res) => {

  const {password} = req.body;

  let query = await db.query(crud.GET_USER_BY_EMAIL, [req.session.user.email]); // get user

  if(query.rowCount <= 0){ //error findiing the user
    res.status(500).send('There was an error updating your password');
    return;
  }

  console.log(query)

  if(query.rows[0].role === 'member'){
    query = await db.query(crud.UPDATE_MEMBER_PASS, [password, query.rows[0].email]); 
  }else if(query.rows[0].role === 'trainer'){
    query = await db.query(crud.UPDATE_TRAINER_PASS, [password, query.rows[0].email ]);  
  }else{
    query = await db.query(crud.UPDATE_ADMIN_PASS [password, query.rows[0].email]); 
  }
  if(query.rowCount <= 0){
    res.status(500).send('There was an error updating your password');
    return;
  }

  res.redirect('/home');
  return;
});

router.route('/goals')
.post(async(req, res) =>{
  let id = req.session.user.id;
  let receivedGoals = req.body;
  let numGoals = (await db.query(crud.GET_FITNESS_GOALS)).rowCount;
  
  // Insert goals
  for(let i = 0; i < numGoals; ++i){
    let fid = i + 1
    // console.log('fid: ', fid, 'curr: ', receivedGoals[`current${i+1}`], 'goal: ', receivedGoals[`goal${i+1}`]);
    if(receivedGoals[`current${i+1}`] && receivedGoals[`goal${i+1}`]){
      query = await db.query(crud.INSERT_MEMBER_GOAL, [id, fid, receivedGoals[`current${i+1}`], receivedGoals[`goal${i+1}`]]);
    }
  }
  res.redirect('/home');
})

router.route('/health')
.post(async(req, res) => {
  const id = req.session.user.id;
  const recievedMetrics = req.body;
  let numMetrics = (await db.query(crud.GET_HEALTH_METRICS)).rowCount;

  // Insert metrics 
  for(let i = 0; i < numMetrics; ++i){
    let mid = i + 1
    if(recievedMetrics[`metric${i+1}`]){
      let query = await db.query(crud.INSERT_MEMBER_HEALTH_METRIC, [id, mid, recievedMetrics[`metric${i+1}`]]);
    }
  }

  res.redirect('/home')
});

router.route('/personalTraining')
.get(async(req, res) => {
  console.log(req.query);
  let {trainerId, name, date, start, end} = req.query;
  let newDate = formatDate(date);

  /* Render a payment page with the details = */
  res.render('billing', {isLoggedIn: req.session.isLoggedIn, memberId: req.session.user.id, trainerId: trainerId, trainerName: name, date: newDate, start: start, end: end, purpose: 'Personal training', amount:  PERSONAL_TRAINING_PRICE, status: 'booked'});
})
.post(async(req, res) => {
 let {memberId, trainerId, date, start, end, status, purpose, amount} = req.body

  // Creating billing
  let query = await db.query(crud.INSERT_BILLING, [memberId, purpose, amount, 'paid']);
  if(query.rowCount){ //only add session after payment
    query = await db.query(crud.INSERT_SESSION, [memberId, trainerId, date, start, end, status]);
    res.redirect('/thankYou');
    return;
  }else{
    res.status(401).send('Could not book session');
    return;
  }
});

router.route('/session/reschedule')
.get(async (req, res) => {
  let {sessionId, trainerId} = req.query;
  let trainerAvailabilities = [];
  let trainerName = '';

  let query = await db.query(crud.GET_TRAINER_AVAILABILITY, [Number(trainerId)]);
  if(query.rowCount) trainerAvailabilities  = query.rows;

  query = await db.query(crud.GET_TRAINER_BY_ID, [Number(trainerId)]);

  if(query.rowCount) trainerName = query.rows[0].name;

  console.log('/first click on reschedule', {trainerId: trainerId, memberId: req.session.user.id, sessionId: sessionId});

  trainerAvailabilities.forEach(avail => {
    avail.sessionId = sessionId
    avail.trainerId =trainerId 
    avail.memberId = req.session.user.id 
  })
  // Render the trainer availabilities
  res.render('trainerAvailabilities', {isLoggedIn: req.session.isLoggedIn, availabilities: trainerAvailabilities, trainerName: trainerName});
})
.post(async(req, res) => { //reschdule session id 
  let {sessionId, trainerId, memberId, date, start, end} = req.body;
 
  console.log('Rescheduling session with: ', req.body)

  let dateFormat = formatDate(date);

  // Update the session id
  let query = await db.query(crud.UPDATE_SESSION, [Number(memberId), Number(trainerId), dateFormat, start, end, 'rescheduled', Number(sessionId)]);
  console.log(query);

  if(query.rowCount){
    res.redirect('/personalTraining');
    return;
  }
  res.status(401).send('Could not reschedule');
  
});

router.route('/session')
.get(async(req, res) => {
  let {id} = req.query;
  console.log('user/session query', id);
  let query = await db.query(crud.DELETE_SESSION, [id]);
  if(query.rowCount){
    res.redirect('/personalTraining');
    return;
  }

  res.status(401).send('Could not delete session');
});

router.route('/class')
.get(async (req, res) => {
  console.log(req.query)
  let {classScheduleId} = req.query;
  let memberId = req.session.user.id;

  let query = await db.query(crud.DELETE_MEMBER_FITNESS_CLASS, [Number(classScheduleId), Number(memberId)]);
  if(query.rowCount) res.redirect('/classes')
  else res.status(401).send('Could not cancel class')
})
.post(async(req, res) => {
  console.log(req.body);
  let {classScheduleId } = req.body
  let id = req.session.user.id;

  try {
    let query = await db.query(crud.INSERT_FITNESS_CLASS_MEMBER, [classScheduleId, id]);
    if(query.rowCount){
      res.redirect('/classes')
    }else{
      res.status(401).send('Could not book class');
    } 
  } catch (error) {
    res.status(401).send('Could not book class' + error.detail);
  }
  
})
module.exports = router;