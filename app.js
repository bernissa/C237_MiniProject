const express = require('express');
const mysql = require('mysql2');
const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'c237_project'
});
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');
// enable static files
app.use(express.static('public'));
// enable form processing
app.use(express.urlencoded({
    extended: false
}));

// Routes for CRUD operations
// Route to retrieve and display all todos
app.get('/list', (req, res) => {
    const sql = 'SELECT * FROM todo';
    // Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving to-do');
        }
        // Render HTML page with data
        res.render('todolist', { todo: results }); // Render HTML page with data
    });
});

app.get('/todos/:id', (req, res) => {
    // Extract the todo ID from the request parameters
    const todoId = req.params.id;
    const sql = 'SELECT * FROM todo WHERE todoId = ?';
    
    // Fetch data from MySQL based on the todo ID
    connection.query(sql, [todoId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving to-do by ID');
        }

        // Check if any todo with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the todo data
            res.render('todoInfo', { todo: results[0] });
        } else {
            // If no todo with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('to-do not found');
        }
    });
});

app.get('/todos', (req, res) => {
    res.render('addTodo');
});

app.post('/todos', (req, res) => {
    // Extract todo data from the request body
    const { description, note, starttime, endtime } = req.body;
    const sql = 'INSERT INTO todo (description, note, starttime, endtime) VALUES (?, ?, ?, ?)';
    // Insert the new todo into the database
    connection.query(sql, [description, note, starttime, endtime], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding to-do:", error);
            res.status(500).send('Error adding to-do');
        } else {
            // Send a success response
            res.redirect('/list');
        }
    });
});

app.get('/todos/:id/update', (req,res) => {
    const todoId = req.params.id;
    const sql = 'SELECT * FROM todo WHERE todoId = ?';
    // Fetch data from MySQL based on the todo ID
    connection.query( sql , [todoId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving to-do by ID');
        }
        // Check if any product with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the todo data
            res.render('updateTodo', { todo: results[0] });
        } else {
            // If no todo with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('to-do not found');
        }
    });
});

app.post('/todos/:id/update', (req, res) => {
    const todoId = req.params.id;
    // Extract todo data from the request body
    const { description, note, starttime, endtime } = req.body;
    const sql = 'UPDATE todo SET description = ? , note = ?, starttime = ?, endtime =? WHERE todoId = ?';
 
    // Insert the new product into the database
    connection.query( sql , [description, note, starttime, endtime, todoId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating to-do:", error);
            res.status(500).send('Error updating to-do');
        } else {
            // Send a success response
            res.redirect('/list');
        }
    });
});

app.get('/todos/:id/delete', (req, res) => {
    const todoId = req.params.id;
    const sql = 'DELETE FROM todo WHERE todoId = ?';
    connection.query( sql , [todoId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting to-do:", error);
            res.status(500).send('Error deleting to-do');
        } else {
            // Send a success response
            res.redirect('/list');
        }
    });
});

// CALENDAR RELATED

// Event Info
app.get('/events/:id', (req, res) => {
    // Extract the todo ID from the request parameters
    const eventId = req.params.id;
    const prevpage = req.query.prevpage;
    const sql = 'SELECT * FROM event WHERE eventId = ?';
    
    // Fetch data from MySQL based on the event ID
    connection.query(sql, [eventId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving event by ID');
        }

        // Check if any event with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the event data
            res.render('eventInfo', { event: results[0], prevpage: prevpage });
        } else {
            // If no event with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('event not found');
        }
    });
});

// Show Events

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM event';;
    // Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving event');
        }
        // Render HTML page with data
        res.render('index', { event: results, prevpage: 'index' }); // Render HTML page with data
    });
});

// Daily calendar

app.get('/dailycalendar', (req, res) => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; 
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];
    const sql = 'SELECT * FROM event WHERE DATE(start) = ?';
    // Fetch data from MySQL
    connection.query( sql, [today],(error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving event');
        }
        // Render HTML page with data
        res.render('dailycalendar', { event: results, day, month, year, prevpage: 'dailycalendar' }); // Render HTML page with data
    });
});

app.get('/events', (req, res) => {
    res.render('addEvent');
});

app.post('/events', (req, res) => {
    // Extract event data from the request body
    const { eventname, start, end } = req.body;
    const sql = 'INSERT INTO event (eventname, start, end) VALUES (?, ?, ?)';
    // Insert the new event into the database
    connection.query(sql, [eventname, start, end], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error adding event:", error);
            res.status(500).send('Error adding event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

app.get('/events/:id/update', (req,res) => {
    const eventId = req.params.id;
    const prevpage = req.query.prevpage; // get prevpage parameter
    const sql = 'SELECT * FROM event WHERE eventId = ?';
    // Fetch data from MySQL based on the event ID
    connection.query( sql , [eventId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving event by ID');
        }
        // Check if any event with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the event data
            res.render('updateEvent', { event: results[0],  prevpage: prevpage });
        } else {
            // If no event with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Event not found');
        }
    });
});

app.post('/events/:id/update', (req, res) => {
    const eventId = req.params.id;
    // Extract event data from the request body
    const { eventname, start, end } = req.body;
    const sql = 'UPDATE event SET eventname = ? , start = ?, end =? WHERE eventId = ?';
 
    // Insert the new event into the database
    connection.query( sql , [eventname, start, end, eventId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error updating event:", error);
            res.status(500).send('Error updating event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
});

app.get('/events/:id/delete', (req, res) => {
    const eventId = req.params.id;
    const sql = 'DELETE FROM event WHERE eventId = ?';
    connection.query( sql , [eventId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting event:", error);
            res.status(500).send('Error deleting event');
        } else {
            // Send a success response
            res.redirect('/');
        }
    });
}); 

// Search Bar

app.get('/results', (req, res) => {
    const searchquery = req.query.query;
    // retrieves event where eventname contains search query
    const sql = 'SELECT * FROM event WHERE eventname LIKE ?';
    const query = `%${searchquery}%`;

    connection.query(sql, [query], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving events');
        }

        // Render page with filtered events
        res.render('filteredEvents', { events: results, query: searchquery, prevpage: 'results' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


