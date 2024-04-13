/**
 * File: classesRouter.js
 * Purpose: responsible for handling classes routes 
 */
const express = require('express');
const crud = require('../data/crud');
const router = express.Router();
const db = require('../data/db');
const { formatDate } = require('../utilities/utilities');

router.route('/')
.get(async(req, res) => {
  let memberId = req.session.user.id;
  let classes = [];
  let memberClasses = [];

  // Get all classes information
  let query = await db.query(crud.GET_ALL_CLASS_SCHEDULE_DETAILS);
  if(query.rowCount) classes = query.rows;

  //Get all member classes
  query = await db.query(crud.GET_CLASS_MEMBER_DETAILS_BY_ID, [Number(memberId)]);
  if(query.rowCount) memberClasses = query.rows;

  res.render('classes', {
    isLoggedIn: req.session.isLoggedIn,
    isAdmin: req.session.user.role === 'admin' ? true : false,
    classes: classes,
    memberClasses: memberClasses
  })
})
module.exports = router;