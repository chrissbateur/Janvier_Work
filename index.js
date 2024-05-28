const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(express.json());
const port = 3306; // Adjust port number as needed


// Database credentials
const pool = mysql.createPool({
  ost: 'bjlxspo3d6b0hhfkgp6x-mysql.services.clever-cloud.com',
  user: 'uxsp9fefzyts0boq',
  password: 'b39ezWJUdmAE3RqCVCce',
  database: 'bjlxspo3d6b0hhfkgp6x'
});
// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Unauthorized access: Token missing');
  jwt.verify(token.replace('Bearer ', ''), 'janvier', (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(403).send('Unauthorized access: Invalid or expired token');
    }
    req.userId = decoded.id;
    next();
  });
};


// ************************************************************* Login Channel ********************************************
app.post('/login', async (req, res) => {
  const { Username, Password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE Username = ?', [Username]);
    if (!users.length) {
      return res.status(404).send('User not found');
    }

    const user = users[0];
    // Compare the provided password with the hashed password in the database
    const PasswordMatch = await bcrypt.compare(Password, user.Password);
    if (!PasswordMatch) {
      return res.status(401).send('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, 'janvier', { expiresIn: '1h' });

    // Send the token as response
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});



// **************************************************** Insert data into users table******************************
app.post('/users',  async (req, res) => {
  const { Username, Password } = req.body; // Destructure data from request body
  if (!Username || !Password) {
    return res.status(400).send('Please provide all required fields (Username,password)');
  }
  try {
    const [result] = await pool.query('INSERT INTO users SET ?', { Username, Password });
    res.json({ message: `User inserted successfully with ID: ${result.insertId}` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting user');
  }
});

// *************************************** Update role *********************************************
app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const { Username, Password } = req.body; // Destructure data from request body
  if (!Username || !Password) {
    return res.status(400).send('Please Fill in all fields ( Username, Password)');
  }
  try {
    const [result] = await pool.query('UPDATE users SET Username = ?, Password = ? WHERE Id = ?', [Username, Password, id]);
    res.json({ message: `User updated successfully with ID: ${req.params.id}` });  // Use ID from request params
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating User');
  }
});

// ******************************************* Delete role by ID*************************************************************
app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM users WHERE Id = ?', [id]);
    res.json({ message: `User with ID ${id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).send('There has been an error deleting user');
  }
});


//********************************** Get all data from a Users table*************************************************************
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('There has been an error showing users');
  }
});

// Select Single role
app.get('/users/:id',  async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE Id = ?', [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('There has been an error showing users');
  }
});



// ************************ Getting Courses from the database *************************************************************
app.get('/courses', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM courses');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error showing courses');
    }
  });
  
  // Select Single Course
  app.get('/courses/:id',  async (req, res) => {
    const id = req.params.id;
    try {
      const [rows] = await pool.query('SELECT * FROM courses WHERE Id = ?', [id]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error showing Courses');
    }
  });

  
// ************************************** Getting Lecturers from the database**************************************************
app.get('/lecturers', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM lecturers');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error showing lecturers');
    }
  });
  
  // Select Single Lecturer
  app.get('/lecturers/:id',  async (req, res) => {
    const id = req.params.id;
    try {
      const [rows] = await pool.query('SELECT * FROM lecturers WHERE Id = ?', [id]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error showing Courses');
    }
  });


  
// **************************** Getting Students from the database *************************************************************

app.get('/students', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM students');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error retrieving students');
    }
  });
  
  // Select Single Student
  app.get('/students/:id',  async (req, res) => {
    const id = req.params.id;
    try {
      const [rows] = await pool.query('SELECT * FROM students WHERE Id = ?', [id]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error showing Courses');
    }
  });
// ********* Inserting the student data into database ********************

app.post('/students',  async (req, res) => {
    const { Name, Email, Phone } = req.body; // Destructure data from request body
    if (!Name || !Email || !Phone) {
      return res.status(400).send('Please provide all required fields (Name, Email , Phone)');
    }
    try {
      const [result] = await pool.query('INSERT INTO students SET ?', { Name, Email, Phone });
      res.json({ message: `Data inserted successfully with ID: ${result.insertId}` });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error inserting Data');
    }
  });

  // ********* Updating the student data ********************
  app.put('/students/:id',  async (req, res) => {
    const id = req.params.id;
    const { Name, Email, Phone } = req.body; // Destructure data from request body
    if (!Name || !Email || !Phone) {
      return res.status(400).send('Please Fill in all fields ( Name, Email, Phone)');
    }
    try {
      const [result] = await pool.query('UPDATE students SET Name = ?, Email = ?, Phone= ? WHERE Id = ?', [Name, Email, Phone, id]);
      res.json({ message: `User updated successfully with ID: ${req.params.id}` });  // Use ID from request params
    } catch (err) {
      console.error(err);
      res.status(500).send('Error updating Student');
    }
  });
            //  ********************* Deleting Student from table ************** 

  app.delete('/students/:id',  async (req, res) => {
    const id = req.params.id;
    try {
      await pool.query('DELETE FROM students WHERE Id = ?', [id]);
      res.json({ message: `Student with ID ${id} deleted successfully` });
    } catch (err) {
      console.error(err);
      res.status(500).send('There has been an error deleting Student');
    }
  });
  


  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  