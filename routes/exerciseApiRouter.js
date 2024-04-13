/**
 * File: exerciseApiRouter.js
 * Purpose: handles api request to the exercise api available here: https://api-ninjas.com/api/exercises
 */
const express = require('express');
const router = express.Router();
const API_KEY = '2Pr8CMwjd881IB4ROVdAQQ==ggefXLlkjd8m7dkT'; // You may need to change this api key for this route to work

router.route('/search')
.get(async(req, res) => {
  const {muscleGroup} = req.query;
  console.log('searching ap with: ', req.query)

  if(!muscleGroup){ // no muscle group specified
    res.redirect('/home');
  }
  let fetchData = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscleGroup}`, {
    headers: {
      'X-Api-Key': API_KEY 
    }
  });
  let data = await fetchData.json();
  res.render('exercises', {title: muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1), exercises: data})
});

module.exports = router;