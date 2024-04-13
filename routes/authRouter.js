/**
 * File: authRouter.js
 * Purpose: responsible for handling authentication
 */
const express = require('express');
const router = express.Router();
const db = require('../data/db');
const crud = require('../data/crud')

router.route('/').get((req, res)=>{
  res.render('login');
})

/* Responsible for registering a new user or logging them in if they exist */
router.route('/register')
.post(async (req, res, next) => {
  const {name, email, password, role} = req.body;
  try {
    let user = await db.query(crud.GET_USER_BY_EMAIL, [email]);
    if(user.rowCount <= 0){ //user doesn't exist, so create them
      if(role === 'member'){
        user = await db.query(crud.CREATE_MEMBER, [name, email, password]);
        req.session.isLoggedIn = true;
        req.session.user = {id: user.rows[0].member_id ,name: user.rows[0].name, email: user.rows[0].email, role: 'member'}
        return res.redirect('/home');
      }
      else if(role === 'trainer'){
        user = await db.query(crud.CREATE_TRAINER, [name, email, password]);
        req.session.isLoggedIn = true;
        req.session.user = {id: user.rows[0].trainer_id ,name: user.rows[0].name, email: user.rows[0].email, role: 'trainer'}
        return res.redirect('/trainer');
      }else{
        return res.redirect('/register');
      }
    }else{// user exists, so login
      if (user.rows[0].password !== password) { // Incorrect password
        return res.redirect('/register');
      }
      req.session.isLoggedIn = true;
      req.session.user = {id: user.rows[0].user_id, name: user.rows[0].name, email: user.rows[0].email, role: user.rows[0].role}
      return res.redirect('/home');
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send('Could not register user');
  }
});

/* Responsible for logging a user in or not if they don't exist */
router.route('/login')
.post(async(req, res, next) => {
  
  const { email, password } = req.body;
  const user = await db.query(crud.GET_ALL_USERS);

  if(user.rowCount <= 0){ // not a user
    req.session.isLoggedIn = false;
    return res.status(401).send('Invalid email or password.');
  }

  /* Find the user */
  let i = 0
  for(i = 0; i < user.rows.length; i++){
    if(user.rows[i].email === email && user.rows[i].password === password){
      break;
    }
  }

  if(i >= user.rows.length){
    req.session.isLoggedIn = false;
    return res.status(401).send('Invalid email or password.');
  }

  req.session.isLoggedIn = true;
  req.session.user = {id: user.rows[i].user_id, name: user.rows[i].name, email: user.rows[i].email, role: user.rows[i].role}

  if(req.session.user.role === 'trainer'){
    res.redirect('/trainer');
  }else if(req.session.user.role === 'admin'){
    res.redirect('/admin');
  }else{
    res.redirect('/home');
  }
  return;
});

module.exports = router;