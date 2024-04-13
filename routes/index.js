/**
 * File: index.js
 * Purpose: responsible for handling main routes to the app
 */
const db = require('../data/db');
const crud = require('../data/crud');
const util = require('../utilities/utilities');

/* Renders the register page */
const register = function(req, res, next){
	res.render('register', {isLoggedIn: req.session.isLoggedIn, isAdmin: req.session.user ? req.session.user.role === 'admin' : false});
}

/* Renders the login page */
const login = function(req, res, next){
	res.render('login', {isLoggedIn: req.session.isLoggedIn, isAdmin: req.session.user ? req.session.user.role === 'admin' : false});
}

/* Renders the login page on logout request */
const logout = function(req, res, next){
	if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(400).send('Unable to log out');
      } else {
        // res.send('Logout successful');
				res.render('login', {isLoggedIn: false, isAdmin: false})
      }
    });
  } else {
    res.end();
  }
}

/* Renders the home page with required info */
const home = async (req, res) => {
	const browseExercises = [
    {displayName: 'Abs', searchName: 'abdominals', img: ''},
    {displayName: 'Biceps', searchName: 'biceps', img: ''},
    {displayName: 'Calves', searchName: 'calves', img: ''},
    {displayName: 'Chest', searchName: 'chest', img: ''},
    {displayName: 'Forearms', searchName: 'forearms', img: ''},
    {displayName: 'Glutes', searchName: 'glutes', img: ''},
    {displayName: 'Hamstrings', searchName: 'hamstrings', img: ''},
    {displayName: 'Lats', searchName: 'lats', img: ''},
    {displayName: 'Lower Back', searchName: 'lower_back', img: ''},
    {displayName: 'Middle Back', searchName: 'middle_back', img: ''},
    {displayName: 'Quads', searchName: 'quadriceps', img: ''},
    {displayName: 'Traps', searchName: 'traps', img: ''},
    {displayName: 'Triceps', searchName: 'triceps', img: ''},
  ];

	const {id, name, email, role} = req.session.user;
	let userRoutines = [];
	let userMetrics = [];
	let userGoals = [];
	let userGoalsCalc = [];
	let fitnessGoals = [];
	let healthMetrics = [];

	// Retrieve member goals, health metrics, user goals
	if(role === 'member'){

		// Member goals
		let query = await db.query(crud.GET_MEMBER_GOALS_BY_ID, [id]);
		if(query.rowCount > 0){
			userGoals = query.rows;
		}

		// Member health metrics
		query = await db.query(crud.GET_MEMBER_METRICS, [id]);
		if(query.rowCount > 0){
			userMetrics = query.rows;
		}

		// Member routines
		query = await db.query(crud.GET_MEMBER_ROUTINES, [id]);
		if(query.rowCount > 0){
			userRoutines= query.rows;
		}

		// General fitness Goals
		query = await db.query(crud.GET_FITNESS_GOALS);
		if(query.rowCount > 0){
			fitnessGoals = query.rows;
		}

		// General health metrics
		query = await db.query(crud.GET_HEALTH_METRICS);
		if(query.rowCount > 0){
			healthMetrics = query.rows;
		}

	}

	// Calculate user goals
	userGoals.forEach((goal) => {
		let {name, current_value, goal_value} = goal;
		let percentage = util.computePercentage(current_value, goal_value);
		userGoalsCalc.push({name: name, currentValue: current_value, goalValue: goal_value, percentage: percentage});
	});

	// console.log('user goals', userGoals)

	// Format user routines 
	userRoutines.forEach((routine) => {
		routine.last_updated = new Date(routine.last_updated).toISOString().split('T')[0];
	})

	// Format fitness goals
	fitnessGoals.forEach((goal) => {
		let currValue = '';
		let goalValue = '';
		let i = 0;
		for(i = 0; i < userGoals.length; i++){
			if(userGoals[i].fitness_goal_id === goal.fitness_goal_id){
				break;
			}
		}
		if(i < userGoals.length){ // If user has a set goal
			currValue = userGoals[i].current_value;
			goalValue = userGoals[i].goal_value;
		}
		goal.currentValue = currValue;
		goal.goalValue = goalValue; 
	});

	// Format health metrics 
	for(let i = 0; i < healthMetrics.length; ++i){
		if(userMetrics[i]){
			healthMetrics[i].currentValue = userMetrics[i].current_value;
		}else{
			healthMetrics[i].currentValue = '';
		}
	}


	res.render('home', {
		title: 'COMP3005 Final Project', 
		name: req.session.user.name.charAt(0).toUpperCase() + req.session.user.name.slice(1), 
		isAdmin: req.session ? req.session.user.role === 'admin' : false, 
		isLoggedIn: req.session.isLoggedIn, 
		mainContent: 'Hello world',
		userRoutines: userRoutines,
		userGoals: userGoals,
		userGoalsCalc: userGoalsCalc,
		userMetrics: userMetrics,
		fitnessGoals: fitnessGoals,
		healthMetrics: healthMetrics,
		browseExercises: browseExercises
	});
}

/* Render the trainer home page with required info */
const trainerHome = async (req, res) => {
	const id = req.session.user.id;

	// Store required info
	let members = []
	let trainerAvailability = [];
	let name = '';
	let email = '';
	let password = '';

	// Get trainer information
	let query = await db.query(crud.GET_TRAINER_BY_ID, [id]);
	if(query.rowCount){
		name = query.rows[0].name;
		email = query.rows[0].email;
		password = query.rows[0].password;
	}

	// Get all members
	query = await db.query(crud.GET_ALL_MEMBER);
	if(query.rowCount){
		query.rows.forEach((row) => {
			let {name, email, registration_date } = row;
			members.push({name: name, email: email, date: registration_date});
		});
	}

	// Get trainer availability
	query = await db.query(crud.GET_TRAINER_AVAILABILITY, [id]);
	if(query.rowCount){
		trainerAvailability = query.rows;	
	}

	res.render('trainer', {
		title: 'Trainer dash', 
		isLoggedIn: req.session.isLoggedIn, 
		name: name,
		email: email,
		password: password,
		trainerAvailability: trainerAvailability,
		members: members 
	});
}

/* Gets all the users from the database */
const users = async(req, res) => {
	const query = await db.query(crud.GET_ALL_USERS);
	res.render('users', {title : 'Users', userEntries: query.rows, isLoggedIn: req.session.isLoggedIn, isAdmin: req.session ? req.session.user.role === 'admin' : false });
}

/* Renders the personal fitness training dashboard */
const personalTraining = async(req, res) => {
	let name = req.session.user.name;
	let trainers = [];
	let memberSessions = [];

	// Get available personal training
	let trainerAvailability = await db.query(crud.GET_ALL_TRAINER_AVAILABILITIES);
	let existingSessions = await db.query(crud.GET_ALL_SESSIONS);

	/**
	 * Check if there exists a session such that 
	 * query.row[i].trainer_id, date_time, start_time, end_time and is active
	 * 
	 */
	if(trainerAvailability.rowCount){
		for(let i = 0; i < trainerAvailability.rowCount; ++i){ //check if there is already a session with the trainer availability
			let alreadyExists = false;
			for(let j = 0; j < existingSessions.rowCount; ++j){
				let currRow = existingSessions.rows[j];
				if(trainerAvailability[i]){
					if(
						(currRow.trainer_id == trainerAvailability[i].trainer_id) && 
						(currRow.date_time == trainerAvailability[i].date_time) && 
						(currRow.start_time == trainerAvailability[i].start_time) && 
						(currRow.end_time == trainerAvailability[i].end_time)
					){alreadyExists = true;}
				}
			}
			if(!alreadyExists){
				trainers.push(trainerAvailability.rows[i]);
			}
		}
	}

	// Get user personal training
	const id  = req.session.user.id;
	let query = await db.query(crud.GET_MEMBER_SESSIONS, [id]);
	if(query.rowCount){
		memberSessions = query.rows;
	}

	console.log('member sessions', memberSessions);

	res.render('personalTraining', {name: name, sessions:[], isLoggedIn: req.session.isLoggedIn, trainers: trainers, memberSessions: memberSessions});
}

const thankYou = (req, res) => {
	res.render('thankYou', {isLoggedIn: req.session.isLoggedIn, message: 'Thank you!! '});
}

const adminHome = async (req, res) => {

	/**
	 * 1. manage room bookings
	 * 2. monitor fitness equipment maintenance
	 * 3. update class schedules
	 * 4. oversee billings
	 * 5. process payments
	 */
	let query;

	let billings = [];
	let equipment = [];
	let roomBookings = [];
	let classes = [];
	let classSchedule = [];

	// Get all classes
	query = await db.query(crud.GET_ALL_CLASSES);
	if(query.rowCount) classes = query.rows;

	// Get class schedule details
	query = await db.query(crud.GET_ALL_CLASS_SCHEDULE_DETAILS);
	if(query.rowCount) classSchedule = query.rows;

	// Get all room bookings
	query = await db.query(crud.GET_ROOM_BOOKINGS_WITH_NAME);
	if(query.rowCount) roomBookings = query.rows; 

	// Get all equipment
	query = await db.query(crud.GET_EQUIPMENT);
	if(query.rowCount) equipment = query.rows;
	
	// Oversee billings
	query = await db.query(crud.GET_ALL_BILLING_WITH_NAME);
	if(query.rowCount) billings = query.rows;

	res.render('admin', {
		isLoggedIn: req.session.isLoggedIn,
		isAdmin: req.session.user.role === 'admin' ? true : false, 
		name: req.session.user.name,
		equipment: equipment,
		billings: billings,
		roomBookings: roomBookings,
		classes: classes,
		classSchedule: classSchedule
	});
}

module.exports = {register, login, logout, home, users, trainerHome, personalTraining, thankYou, adminHome};