const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'blood-donation-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

// ---------- Helper middleware ----------
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please log in first' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || !req.session.user.is_admin) {
        return res.status(403).json({ error: 'Admin access only' });
    }
    next();
}

// =====================================================
// AUTH ROUTES
// =====================================================

// Register a new account
app.post('/api/register', (req, res) => {
    const { name, email, password, age, blood_group, phone, address } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const checkSql = 'SELECT id FROM users WHERE email = ?';
    db.query(checkSql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const insertSql = `INSERT INTO users (name, email, password, age, blood_group, phone, address)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(insertSql, [name, email, hashedPassword, age || null, blood_group || null, phone || null, address || null],
            (err2, result) => {
                if (err2) return res.status(500).json({ error: err2.message });
                res.json({ message: 'Account created successfully', id: result.insertId });
            });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const match = bcrypt.compareSync(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // store minimal info in session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: !!user.is_admin
        };

        res.json({ message: 'Login successful', is_admin: !!user.is_admin });
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out' });
    });
});

// Get current logged-in user (for dashboard to check session)
app.get('/api/me', requireLogin, (req, res) => {
    const sql = `SELECT id, name, email, age, blood_group, phone, address, last_donation_date, is_admin
                 FROM users WHERE id = ?`;
    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});

// =====================================================
// NORMAL USER: view / update own profile
// =====================================================

app.put('/api/me', requireLogin, (req, res) => {
    const { name, age, blood_group, phone, address, last_donation_date } = req.body;
    const sql = `UPDATE users SET name=?, age=?, blood_group=?, phone=?, address=?, last_donation_date=?
                 WHERE id=?`;
    db.query(sql, [name, age || null, blood_group || null, phone || null, address || null,
        last_donation_date || null, req.session.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        req.session.user.name = name;
        res.json({ message: 'Profile updated successfully' });
    });
});

// =====================================================
// "NEED BLOOD" DIRECTORY: any logged-in user can VIEW/SEARCH
// donors, but cannot edit them. Only admin can edit (below).
// =====================================================

app.get('/api/donors', requireLogin, (req, res) => {
    const { blood_group, name } = req.query;

    let sql = `SELECT name, blood_group, last_donation_date, phone, address
               FROM users WHERE 1=1`;
    const params = [];

    if (blood_group) {
        sql += ' AND blood_group = ?';
        params.push(blood_group);
    }
    if (name) {
        sql += ' AND name LIKE ?';
        params.push(`%${name}%`);
    }

    sql += ' ORDER BY name ASC';

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// =====================================================
// ADMIN: manage all users
// =====================================================

// Get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
    const sql = `SELECT id, name, email, age, blood_group, phone, address, last_donation_date, is_admin
                 FROM users ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update any user's details
app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const { name, age, blood_group, phone, address, last_donation_date } = req.body;
    const sql = `UPDATE users SET name=?, age=?, blood_group=?, phone=?, address=?, last_donation_date=?
                 WHERE id=?`;
    db.query(sql, [name, age || null, blood_group || null, phone || null, address || null,
        last_donation_date || null, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User updated successfully' });
    });
});

// Delete a user
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    db.query('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
