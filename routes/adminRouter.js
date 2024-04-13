const express = require('express');
const crud = require('../data/crud');
const router = express.Router();
const db = require('../data/db');
const { formatDate } = require('../utilities/utilities');

router.route('/')
.get((req, res) => {
  res.redirect('/adminHome');
});

router.route('/equipment')
.post(async (req, res) => {
  let {equipmentId, lastMaintained, status} = req.body;
  console.log(req.body);
  console.log(lastMaintained);
  let dateFormat = formatDate(lastMaintained);

  // update the equpment
  let query = await db.query(crud.UPDATE_EQUIPMENT, [dateFormat, status, equipmentId])

  if(query.rowCount) res.redirect('/adminHome');
  else res.status(401).send('Could not update equipment');
});

router.route('/room')
.post(async (req, res) => {
  console.log(req.body);
  let {roomNumber, date, start, end, purpose} = req.body;
  const newDate = formatDate(date);

  let query = await db.query(crud.GET_ROOM_BY_ROOM_NUMBER, [roomNumber]);
  if(query.rowCount){
    const {room_id} = query.rows[0];
    console.log('room id', room_id);
    query = await db.query(crud.INSERT_ROOM_BOOKING, [room_id, newDate, start, end, purpose]);
    if(query.rowCount) res.redirect('/admin');
    else res.status(401).send('Could not create room booking')
 }
  else res.status(401).send('Could not find room number: ' + roomNumber)
});

router.route('/booking')
.get(async(req, res) => {
  console.log(req.query);
  const {id} = req.query;

  if(id){
    let query = await db.query(crud.DELETE_ROOM_BOOKING, [Number(id)]);
    if(query.rowCount){
      res.redirect('/admin')
    }else{
      res.status(401).send('Could not delete room booking')
    }
  }else{
    res.status(401).send('Could not delete room booking')
  }
});

router.route('/class')
.get(async (req, res) => {
  const {id} = req.query;
  let query = await db.query(crud.DELETE_CLASS_SCHEDULE, [id]);
  if(query.rowCount) res.redirect('/admin')
  else res.status(401).send('Could not delete class schedule')
})
.post(async (req, res) => {
  console.log(req.body)
  let {classId, roomBookingId} = req.body;
  let query = await db.query(crud.CREATE_CLASS_SCHEDULE, [classId, roomBookingId]);
  if(query.rowCount){
    res.redirect('/admin');
    return;
  }
  res.status(401).send('Could not add class to schedule');

})

module.exports = router;