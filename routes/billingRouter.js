/**
 * File: billingRouter.js
 * Purpose: responsible for handling any billing routes (e.g., creating new exercise)
 */
const express = require('express');
const crud = require('../data/crud');
const router = express.Router();
const db = require('../data/db');

router.route('/')
.post(async (req, res) => {
  console.log(req.body);
  /* insert data into billing table */

  res.render('thankYou', {message: 'Thank you for your purchase'})
})

module.exports = router;