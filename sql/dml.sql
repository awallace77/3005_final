
-- Populating users
INSERT INTO admin (name, email, password) VALUES ('admin', 'admin@mail.com', 'secret');
INSERT INTO trainer(name, email, password) VALUES( 'trainer', 'trainer@mail.com', 'secret');
INSERT INTO trainer(name, email, password) VALUES( 'John', 'john@mail.com', 'secret');
INSERT INTO member(name, email, password) VALUES( 'andrew', 'andrew@mail.com', 'secret');

-- Populating rooms
INSERT INTO room (name, room_number) 
VALUES
  ('Yoga room', 1),
  ('Spin room', 2),
  ('Hit room', 3)
;

-- Poopulating equipment
INSERT INTO equipment (name, last_maintained, status)
VALUES
  ('Bench press machine', CURRENT_DATE, 'Good'),
  ('Squat rack', CURRENT_DATE, 'Needs repair'),
  ('Lat pull down', CURRENT_DATE, 'Fair'),
  ('Leg extension', CURRENT_DATE, 'Fair'),
  ('Hamstring curl', CURRENT_DATE, 'Needs repair'),
  ('Dumbbell rack', CURRENT_DATE, 'Good')
;

-- Populating health_metric
INSERT INTO health_metric (name, description) 
VALUES 
('Body weight', 'Current body weight'),
('Height', 'Current height'),
('Body fat percentage', 'Current body fat percentage');

-- Populating fitness_goal
INSERT INTO fitness_goal (name, description) 
VALUES 
('Weight Loss', 'Target weight to achieve'),
('Muscle Gain', 'Target muscle mass to achieve'),
('Running Distance', 'Target distance to run'),
('Strength Training', 'Specific strength training goal'),
('Body Fat Percentage', 'Target body fat percentage'),
('Body Mass Index', 'Target BMI score'),
('Calorie intake', 'Target calorie intake per day'),
('Calorie burn', 'Target calories burned per day');

-- Populating fitness classes
INSERT INTO fitness_class (trainer_id, name, description) VALUES 
(1, 'Hot Yoga', '45 minute hot yoga class'),
(1, 'HIIT', '1 hour HIIT class'),
(2, 'Spin', '30 minute spin class')
;
