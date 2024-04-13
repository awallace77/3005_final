const MEMBER_TABLE = 'member';
const TRAINER_TABLE = 'trainer';
const ADMIN_TABLE = 'admin';
const HEALTH_METRIC_TABLE = 'health_metric';
const MEMBER_HEALTH_METRIC_TABLE = 'member_health_metric';
const FITNESS_GOAL_TABLE = 'fitness_goal';
const MEMBER_GOAL_TABLE = 'member_goal';
const MEMBER_ROUTINE_TABLE = 'member_routine';
const TRAINER_AVAILABILITY_TABLE = 'trainer_availability';
const MEMBER_GOALS_VIEW = 'all_member_goals';
const ALL_USERS_WITH_ROLES_VIEW = 'all_users_with_roles';
const MEMBER_METRICS_VIEW = 'all_member_health_metrics';
const MEMBER_GOALS_WITH_NAME_VIEW = 'all_member_goals_with_name';
const TRAINER_AVAILABILITIES_VIEW = 'all_trainer_availabilities';
const ALL_BILLINGS_WITH_NAMES_VIEW = 'all_member_billings';
const TRAINING_SESSION_TABLE = 'training_session';
const BILLING_TABLE = 'billing';
const EQUIPMENT_TABLE = 'equipment';
const ROOM_TABLE = 'room';
const ROOM_BOOKING_TABLE = 'room_booking';
const ALL_BOOKINGS_WITH_NAME_VIEW = 'all_room_bookings_with_name';
const ALL_CLASSES_VIEW = 'all_classes';
const CLASS_SCHEDULE_TABLE = 'class_schedule';
const ALL_CLASS_SCHEDULE_VIEW = 'class_schedule_details';
const FITNESS_CLASS_MEMBER_TABLE = 'fitness_class_member'; 
const CLASS_MEMBER_DETAILS_VIEW = 'class_member_details';

/* SQL Statements */ 
let CRUD = {
  GET_ALL_USERS: `SELECT * FROM ${ALL_USERS_WITH_ROLES_VIEW};`,
  GET_USER_BY_EMAIL: `SELECT * FROM all_users_with_roles WHERE email = $1;`, 
  GET_ALL_MEMBER: `SELECT * FROM ${MEMBER_TABLE};`,
  
  /* Member */
  CREATE_MEMBER: `INSERT INTO ${MEMBER_TABLE} (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, 
  GET_MEMBER_BY_ID: `SELECT * FROM ${MEMBER_TABLE} WHERE ${MEMBER_TABLE}.member_id = $1;`,
  GET_MEMBER_BY_EMAIL: `SELECT * FROM ${MEMBER_TABLE} WHERE ${MEMBER_TABLE}.email = $1;`,
  GET_MEMBER_SESSIONS: `SELECT * FROM ${TRAINING_SESSION_TABLE} WHERE member_id = $1;`,
  UPDATE_MEMBER_EMAIL: `UPDATE ${MEMBER_TABLE} SET email = $1 WHERE ${MEMBER_TABLE}.email = $2 RETURNING *;`,
  UPDATE_MEMBER_PASS: `UPDATE ${MEMBER_TABLE} SET password = $1 WHERE ${MEMBER_TABLE}.email = $2 RETURNING *;`,
  UPDATE_MEMBER_METRIC: `INSERT INTO ${MEMBER_HEALTH_METRIC_TABLE} (member_id, health_metric_id, current_value) VALUES ($1, $2, $3)
                          ON CONFLICT (member_id, health_metric_id)
                          DO UPDATE SET
                              current_value = EXCLUDED.current_value
                        ;`,
  

  /* Health metrics */
  GET_HEALTH_METRICS:`SELECT * FROM ${HEALTH_METRIC_TABLE};`,
  GET_MEMBER_METRICS: `SELECT * FROM ${MEMBER_METRICS_VIEW} WHERE member_id = $1;`,
  INSERT_MEMBER_HEALTH_METRIC: `INSERT INTO ${MEMBER_HEALTH_METRIC_TABLE} (member_id, health_metric_id, current_value) VALUES ($1, $2, $3)
                      ON CONFLICT (member_id, health_metric_id) DO UPDATE 
                      SET 
                        current_value = EXCLUDED.current_value,
                        last_updated = CURRENT_DATE
                      RETURNING *;`,
                      

  /* Fitness goals */
  GET_FITNESS_GOALS: `SELECT * FROM ${FITNESS_GOAL_TABLE};`,
  GET_MEMBER_GOALS_BY_ID: `SELECT * FROM ${MEMBER_GOALS_VIEW} WHERE member_id = $1;`,
  GET_MEMBER_GOALS: `SELECT * FROM ${MEMBER_GOALS_VIEW};`,
  GET_MEMBER_GOALS_WITH_NAME: `SELECT * FROM ${MEMBER_GOALS_WITH_NAME_VIEW} WHERE member_id = $1;`,
  INSERT_MEMBER_GOAL: `INSERT INTO ${MEMBER_GOAL_TABLE} (member_id, fitness_goal_id, current_value, goal_value) VALUES ($1, $2, $3, $4)
                      ON CONFLICT (member_id, fitness_goal_id) DO UPDATE 
                      SET 
                        current_value = EXCLUDED.current_value,
                        goal_value = EXCLUDED.goal_value,
                        last_updated = CURRENT_DATE
                      RETURNING *;`,

  /* Member Routines */
  GET_MEMBER_ROUTINES: `SELECT * FROM ${MEMBER_ROUTINE_TABLE} WHERE member_id = $1 ORDER BY last_updated DESC;`,
  CREATE_MEMBER_ROUTINE: `INSERT INTO ${MEMBER_ROUTINE_TABLE} (member_id, name, description, duration, last_updated) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                      
  /* Trainer */
  GET_TRAINER_BY_EMAIL: `SELECT * FROM ${TRAINER_TABLE} WHERE email = $1;`,
  GET_TRAINER_BY_ID: `SELECT * FROM ${TRAINER_TABLE} WHERE trainer_id = $1;`,
  UPDATE_TRAINER_EMAIL: `UPDATE ${TRAINER_TABLE} SET email = $1 WHERE ${TRAINER_TABLE}.email = $2 RETURNING *;`,
  UPDATE_TRAINER_PASS: `UPDATE ${TRAINER_TABLE} SET password = $1 WHERE ${TRAINER_TABLE}.email = $2 RETURNING *;`,
  CREATE_TRAINER: `INSERT INTO ${TRAINER_TABLE} (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, 
  GET_TRAINER_AVAILABILITY: `SELECT * FROM ${TRAINER_AVAILABILITY_TABLE} WHERE trainer_id = $1 ORDER BY date_time ASC;`,
  GET_TRAINER_AVAILABILITY_BY_DATE: `SELECT * FROM ${TRAINER_AVAILABILITY_TABLE} WHERE date_time = $1;`,
  GET_ALL_TRAINER_AVAILABILITIES: `SELECT * FROM ${TRAINER_AVAILABILITIES_VIEW};`,
  DELETE_TRAINER_AVAILABILITY: `DELETE FROM ${TRAINER_AVAILABILITY_TABLE} WHERE trainer_id = $1 AND date_time = $2 RETURNING *;`,
  INSERT_TRAINER_AVAILABILITY: `INSERT INTO ${TRAINER_AVAILABILITY_TABLE} (trainer_id, date_time, start_time, end_time) VALUES ($1, $2, $3, $4)
                      ON CONFLICT (trainer_id, date_time) DO UPDATE 
                      SET 
                        start_time = EXCLUDED.start_time,
                        end_time = EXCLUDED.end_time
                      RETURNING *;`,

  /* Training Sessions */
  GET_ALL_SESSIONS: `SELECT * FROM ${TRAINING_SESSION_TABLE};`,
  INSERT_SESSION: `INSERT INTO ${TRAINING_SESSION_TABLE} (member_id, trainer_id, date_time, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (member_id, trainer_id, date_time, start_time, end_time) DO UPDATE 
                      SET 
                        date_time = EXCLUDED.date_time,
                        start_time = EXCLUDED.start_time,
                        end_time = EXCLUDED.end_time,
                        status = 'booked'
                      RETURNING *;`,
  DELETE_SESSION: `DELETE FROM ${TRAINING_SESSION_TABLE} WHERE training_session_id = $1 RETURNING *;`,
  UPDATE_SESSION: `UPDATE ${TRAINING_SESSION_TABLE} 
  SET 
    member_id= $1,
    trainer_id= $2, 
    date_time= $3,
    start_time= $4,
    end_time= $5,
    status= $6
    WHERE training_session_id = $7 RETURNING *
  ;`,

  /* Admin */
  UPDATE_ADMIN_EMAIL: `UPDATE ${ADMIN_TABLE} SET email = $1 WHERE ${ADMIN_TABLE}.email = $2 RETURNING *;`,
  UPDATE_ADMIN_PASS: `UPDATE ${ADMIN_TABLE} SET password = $1 WHERE ${ADMIN_TABLE}.email = $2 RETURNING *;`,

  /* Billing */
  GET_ALL_BILLING: `SELECT * FROM ${BILLING_TABLE};`,
  INSERT_BILLING: `INSERT INTO ${BILLING_TABLE} (
    member_id, purpose, amount, status
  )
  VALUES ($1, $2, $3, $4);`,
  GET_ALL_BILLING_WITH_NAME: `SELECT * FROM ${ALL_BILLINGS_WITH_NAMES_VIEW};`,

  /* Equipment */
  GET_EQUIPMENT: `SELECT * FROM ${EQUIPMENT_TABLE} ORDER BY equipment_id ASC;`,
  UPDATE_EQUIPMENT: `UPDATE ${EQUIPMENT_TABLE} SET last_maintained= $1, status=$2 WHERE equipment_id = $3 RETURNING *;`,

  /* Room booking */
  INSERT_ROOM_BOOKING: `INSERT INTO ${ROOM_BOOKING_TABLE} (room_id, date_time, start_time, end_time, purpose) VALUES ($1, $2, $3, $4, $5);`,
  GET_ROOM_BY_ROOM_NUMBER: `SELECT * FROM ${ROOM_TABLE} WHERE room_number = $1;`,
  GET_ROOM_BOOKINGS_WITH_NAME: `SELECT * FROM ${ALL_BOOKINGS_WITH_NAME_VIEW};`,
  DELETE_ROOM_BOOKING: `DELETE FROM ${ROOM_BOOKING_TABLE} WHERE room_booking_id = $1;`,

  /* Classes */
  GET_ALL_CLASSES: `SELECT * FROM ${ALL_CLASSES_VIEW};`,
  CREATE_CLASS_SCHEDULE: `INSERT INTO ${CLASS_SCHEDULE_TABLE} (class_id, room_booking_id) VALUES ($1, $2);`,
  GET_ALL_CLASS_SCHEDULE_DETAILS: `SELECT * FROM ${ALL_CLASS_SCHEDULE_VIEW};`,
  DELETE_CLASS_SCHEDULE: `DELETE FROM ${CLASS_SCHEDULE_TABLE} 
  WHERE class_schedule_id = $1;`,

  /* Fitness class member */
  INSERT_FITNESS_CLASS_MEMBER: `INSERT INTO ${FITNESS_CLASS_MEMBER_TABLE}(class_schedule_id, member_id) 
  VALUES ($1, $2) RETURNING *;`,

  GET_CLASS_MEMBER_DETAILS_BY_ID: `SELECT * FROM ${CLASS_MEMBER_DETAILS_VIEW} WHERE member_id = $1;`,DELETE_MEMBER_FITNESS_CLASS: `DELETE FROM ${FITNESS_CLASS_MEMBER_TABLE} WHERE class_schedule_id = $1 AND member_id = $2;`
}

module.exports = CRUD;
