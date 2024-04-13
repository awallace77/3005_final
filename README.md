# Health and Fitness Club Management System
## Purpose
The purpose of this system is to provide members, trainers, and admin staff functionalities to interact with a health and fitness club. This includes, tracking personal fitness goals, booking group fitness classes, and managing administrative tasks such as billings.

## System Architecture
Please refer the the /docs folder to learn about the system architecture, technologies used, and database design.

## Getting started
To get started with this application download or clone the git repository and then proceed with the following steps

### Prerequisites
- you must have node.js, PostgreSQL, and a code editor installed.

### Database and intialization
1. Create a new database within PostgreSQL
2. Navigate to the /sql folder and run the `ddl.sql` and `dml.sql` scripts in your newly created database
3. create a `.env` file in the root directory (i.e., /3005_final)
4. Provide the following:<br/>
DATABASE_USER=\<enter databse user here\><br/>
DATABASE_PASSWORD=\<enter database password here\><br/>
DATABASE_HOST=\<enter database host here (usually "localhost")\><br/>
DATABASE_PORT=\<enter database port number here\> <br/>
DATABASE_NAME=\<enter database name here\><br/>
COOKIE_SECRET=dfaoeruldjhboaleuas23<br/>
5. naviage to the root folder and run `npm install` 

### Execution
6. to start the application run `node server.js` in the root directory
7. navigate to http://localhost:3000/
<br/>
Congratulations, you should see the home page of the application and can begin working with it.

### Using the application
There are four intially created users:<br/>
<strong>User 1</strong>: <br/>
Name: andrew <br/>
Email: andrew@mail.com <br>
Password: secret <br>
Role: member <br/>
<strong>User 2</strong>: <br/>
Name:  trainer<br/>
Email: trainer@mail.com <br>
Password: secret <br>
Role: trainer <br/>
<strong>User 3</strong>: <br/>
Name: John<br/>
Email: john@mail.com <br>
Password: secret<br>
Role: trainer <br/>
<strong>User 4</strong>: <br/>
Name: admin <br/>
Email: admin@mail.com <br>
Password: secret <br>
Role: admin<br/>

## Important notes
- please note that the development was done completely locally on a Windows 11 OS and may not work with other operating systems or 3rd party hosting services.
- no authentication / advanced password hashing was done, so be careful when inputting sensitive data.

## Video Demonstration
For a full demo of the applicaiton please watch the demo here: 
https://youtu.be/peMy_6Zggq0



