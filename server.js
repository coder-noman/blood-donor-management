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
    const sql = `SELECT id, name, email, age, blood_group, phone, address, last_donation_date, is_admin, is_available
                 FROM users WHERE id = ?`;
    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(results[0]);
    });
});

// =====================================================
// FEATURE 1: NEED BLOOD - any logged-in user can view all donors
// =====================================================

app.get('/api/donors', requireLogin, (req, res) => {
    const sql = `SELECT name, blood_group, phone, address, last_donation_date, is_available
                 FROM users ORDER BY is_available DESC, name ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
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
// FEATURE 4: MARK AVAILABLE TO DONATE
// =====================================================

app.put('/api/me/availability', requireLogin, (req, res) => {
    const { is_available } = req.body;
    const value = is_available ? 1 : 0;

    db.query('UPDATE users SET is_available=? WHERE id=?', [value, req.session.user.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: value ? 'You are now marked as available to donate' : 'You are now marked as unavailable', is_available: !!value });
    });
});

// =====================================================
// FEATURE 2: CHANGE PASSWORD
// =====================================================

app.put('/api/me/password', requireLogin, (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Both current and new password are required' });
    }
    if (new_password.length < 4) {
        return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }

    const sql = 'SELECT password FROM users WHERE id = ?';
    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const match = bcrypt.compareSync(current_password, results[0].password);
        if (!match) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedNew = bcrypt.hashSync(new_password, 10);
        db.query('UPDATE users SET password=? WHERE id=?', [hashedNew, req.session.user.id], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ message: 'Password changed successfully' });
        });
    });
});

// =====================================================
// ADMIN: manage all users
// =====================================================

// Get all users
app.get('/api/admin/users', requireAdmin, (req, res) => {
    const sql = `SELECT id, name, email, age, blood_group, phone, address, last_donation_date, is_admin, is_available
                 FROM users ORDER BY id DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Update any user's details
app.put('/api/admin/users/:id', requireAdmin, (req, res) => {
    const { name, age, blood_group, phone, address, last_donation_date, is_available } = req.body;
    const sql = `UPDATE users SET name=?, age=?, blood_group=?, phone=?, address=?, last_donation_date=?, is_available=?
                 WHERE id=?`;
    db.query(sql, [name, age || null, blood_group || null, phone || null, address || null,
        last_donation_date || null, is_available ? 1 : 0, req.params.id], (err) => {
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

// =====================================================
// FEATURE 3: BLOOD GROUP STATISTICS (admin only)
// =====================================================

app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const sql = `SELECT blood_group, COUNT(*) AS total
                 FROM users
                 WHERE blood_group IS NOT NULL AND blood_group <> ''
                 GROUP BY blood_group
                 ORDER BY total DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
