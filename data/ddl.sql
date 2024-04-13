
/*
DROP DATABASE IF EXISTS fitness_app;
CREATE DATABASE fitness_app; 
*/

-- Dependendent tabbles
DROP TABLE IF EXISTS fitness_class_member; -- member and class_schedule 
DROP TABLE IF EXISTS member_health_metric; -- member and health_metric
DROP TABLE IF EXISTS class_schedule; -- fitness_class and room_booking 
DROP TABLE IF EXISTS member_goal; -- member and fitness_goal
DROP TABLE IF EXISTS room_booking; -- fitness_class
DROP TABLE IF EXISTS training_session; -- trainer and member
DROP TABLE IF EXISTS member_routine; -- member
DROP TABLE IF EXISTS billing; -- member
DROP TABLE IF EXISTS trainer_availability; -- trainer
DROP TABLE IF EXISTS fitness_class; -- trainer 

--Independent tables
DROP TABLE IF EXISTS member;
DROP TABLE IF EXISTS health_metric;
DROP TABLE IF EXISTS goal_type;
DROP TABLE IF EXISTS trainer;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS equipment;


-- Member table
CREATE TABLE member (
  member_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trainer
CREATE TABLE trainer(
  trainer_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admin
CREATE TABLE admin(
  admin_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Health Metric
CREATE TABLE health_metric(
  health_metric_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- Member health metric 
CREATE TABLE member_health_metric(
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  health_metric_id INTEGER REFERENCES health_metric(health_metric_id) NOT NULL,
  current_value VARCHAR(255) NOT NULL,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE NOT NULL,
  PRIMARY KEY(member_id, health_metric_id)
);

-- Fitness goal
CREATE TABLE fitness_goal (
  fitness_goal_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- Member goal 
CREATE TABLE member_goal (
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  fitness_goal_id INTEGER REFERENCES fitness_goal(fitness_goal_id) NOT NULL,
  current_value VARCHAR(255) NOT NULL,
  goal_value VARCHAR(255) NOT NULL,
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE NOT NULL,
  PRIMARY KEY(member_id, fitness_goal_id)
);

-- Member routine
CREATE TABLE member_routine (
  routine_id SERIAL PRIMARY KEY NOT NULL,
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  duration VARCHAR(50),
  last_updated DATE NOT NULL DEFAULT CURRENT_DATE NOT NULL,
  UNIQUE(member_id, name)
);

-- Trainer availability
CREATE TABLE trainer_availability(
  trainer_id INTEGER REFERENCES trainer(trainer_id) NOT NULL,
  date_time DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  PRIMARY KEY (trainer_id, date_time)
);

-- Training session
CREATE TABLE training_session(
  training_session_id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  trainer_id INTEGER REFERENCES trainer(trainer_id) NOT NULL,
  date_time DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  CONSTRAINT unique_session UNIQUE (member_id, trainer_id, date_time, start_time, end_time)
);


-- Fitness class
CREATE TABLE fitness_class(
  class_id SERIAL PRIMARY KEY,
  trainer_id INTEGER REFERENCES trainer(trainer_id),
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255)
);

-- Room
CREATE TABLE room(
  room_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  room_number INTEGER NOT NULL,
  UNIQUE(room_number)
);

-- Room booking
CREATE TABLE room_booking(
  room_booking_id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES room(room_id) NOT NULL,
  date_time DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  purpose VARCHAR(50)
);

-- Function for checking overlapping start and end times on room booking
CREATE OR REPLACE FUNCTION check_room_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM room_booking
    WHERE room_id = NEW.room_id
    AND date_time = NEW.date_time
    AND NOT (NEW.end_time <= start_time OR NEW.start_time >= end_time)
  ) THEN
    RAISE EXCEPTION 'Room booking overlaps with an existing booking';
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Room booking overlap trigger
CREATE TRIGGER room_booking_overlap_trigger
  BEFORE INSERT ON room_booking
  FOR EACH ROW
  EXECUTE FUNCTION check_room_booking_overlap()
;

-- Class schedule
CREATE TABLE class_schedule(
  class_schedule_id SERIAL PRIMARY KEY,
  class_id INTEGER REFERENCES fitness_class(class_id) NOT NULL,
  room_booking_id INTEGER REFERENCES room_booking(room_booking_id) NOT NULL
);

-- Fitness class members
CREATE TABLE fitness_class_member(
  class_schedule_id INTEGER REFERENCES class_schedule(class_schedule_id) NOT NULL,
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  PRIMARY KEY(class_schedule_id, member_id)
);

-- Billing
CREATE TABLE billing(
  billing_id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES member(member_id) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  billing_date DATE NOT NULL DEFAULT CURRENT_DATE NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- Equipment
CREATE TABLE equipment(
  equipment_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  last_maintained DATE NOT NULL NOT NULL,
  status VARCHAR(50) NOT NULL
);

-- Views
CREATE VIEW all_users_with_roles AS
  SELECT 'admin' AS role, admin_id AS user_id, username, email, password FROM admin
  UNION ALL
  SELECT 'member' AS role, member_id AS user_id, username, email, password FROM member
  UNION ALL
  SELECT 'trainer' AS role, trainer_id AS user_id, username, email, password FROM trainer
;

CREATE VIEW all_member_goals AS
  SELECT member_id, mg.fitness_goal_id, name, description, current_value, goal_value, last_updated 
  FROM member_goal AS mg JOIN fitness_goal AS fg ON mg.fitness_goal_id = fg.fitness_goal_id
;

CREATE VIEW all_member_health_metrics AS
  SELECT member_id, mhm.health_metric_id, name, description, current_value, last_updated 
  FROM member_health_metric AS mhm JOIN health_metric AS hm ON mhm.health_metric_id = hm.health_metric_id
;

CREATE VIEW all_member_goals_with_name AS 
  SELECT
    mfg.member_id, 
    mfg.name member_name,
    mfg.email,
    mfg.fitness_goal_id,
    fg.name goal,
    fg.description, 
    mfg.current_value, 
    mfg.goal_value
  FROM (
	  SELECT 
		  m.member_id, m.name, m.email,
		  mg.fitness_goal_id, mg.current_value, mg.goal_value 
	  FROM member AS m JOIN member_goal AS mg ON m.member_id = mg.member_id
  ) AS mfg JOIN fitness_goal AS fg
  ON mfg.fitness_goal_id = fg.fitness_goal_id
;

CREATE VIEW all_trainer_availabilities AS
  SELECT 
	  ta.trainer_id, t.name, t.email, ta.date_time, ta.start_time, ta.end_time 
  FROM trainer_availability as ta JOIN trainer as t ON ta.trainer_id = t.trainer_id
;

-- Get all billings with member names and emails
CREATE VIEW all_member_billings AS
  SELECT b.billing_id, b.member_id, m.name, m.email, b.purpose, b.amount, b.billing_date, b.status 
  FROM billing AS b
  JOIN member AS m 
  ON m.member_id = b.member_id
;

-- Get all classes with trainer names and emails
CREATE VIEW all_classes AS 
	SELECT class_id, fc.trainer_id, t.name, t.email, fc.name AS class_name, fc.description 
	FROM fitness_class AS fc 
	JOIN trainer AS t 
	ON t.trainer_id = fc.trainer_id
;

-- Get all room bookings with the name and room number
CREATE VIEW all_room_bookings_with_name AS
	SELECT rb.room_booking_id, rb.room_id, r.name, r.room_number, rb.date_time, rb.start_time, rb.end_time, rb.purpose 
	FROM room_booking as rb
	JOIN room as r 
	ON rb.room_id = r.room_id
;

-- Get all class schedules with their details
CREATE VIEW class_schedule_details AS
  SELECT cs.class_schedule_id, fc.name AS class_name, fc.description AS class_description, 
        r.name AS room_name, r.room_number, rb.purpose, rb.date_time, rb.start_time, rb.end_time
  FROM class_schedule AS cs
  JOIN fitness_class AS fc ON cs.class_id = fc.class_id
  JOIN room_booking AS rb ON cs.room_booking_id = rb.room_booking_id
  JOIN room AS r ON rb.room_id = r.room_id
;