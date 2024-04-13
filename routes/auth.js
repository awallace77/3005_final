/**
 * File: auth.js
 * Purpose: defines middleware for: 1. checking if user is logged in, 2. checking if user is an admin  
*/

const authChecker = (req, res, next) => {
  if(req.session.isLoggedIn || req.path === '/auth'){
    next();
  }else{
    res.redirect('/login');
  }
}

const trainerAuthChecker = (req, res, next) => {
  if(req.session.isLoggedIn || req.path === '/auth'){
    if(req.session.user){
      if(req.session.user.role === 'trainer'){
        next();
        return;
      }
    }
  }else{
    res.redirect('/home');
  }
}

const adminAuthChecker = (req, res, next) => {
  if(req.session.isLoggedIn || req.path === '/auth'){
    if(req.session.user){
      if(req.session.user.role === 'admin'){
        next();
        return;
      }
    }
  }
  res.redirect('/home');
}

module.exports = {authChecker, trainerAuthChecker, adminAuthChecker};