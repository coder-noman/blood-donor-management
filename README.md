# Blood Donation Management System (DBMS Project)

A web app where:
- Anyone can **register** an account and **log in**
- Each user has a **dashboard** to view/update their own details, and can **change their password**
- Any logged-in user can click **"Need Blood"** to see every donor's details (name, blood group, phone, address, last donation date) and filter by blood group
- One account is the **admin**, who has a separate panel to view/edit/delete every user, plus a **blood group statistics** summary

Built with plain HTML, CSS, JavaScript on the frontend and Node.js + Express + MySQL on the backend.
Passwords are stored securely (hashed with bcrypt), and login uses sessions.

## Project Structure
```
blood-final/
│── server.js               -> Main backend server (all routes)
│── database.sql             -> SQL script to create database & table
│── package.json              -> Node dependencies
│── config/
│    └── db.js                 -> MySQL connection settings
└── public/
     │── index.html            -> Login page (home page)
     │── register.html          -> Sign up page
     │── dashboard.html          -> User dashboard (view/update own info + change password)
     │── admin.html               -> Admin panel (manage users + blood group stats)
     │── donors.html               -> "Need Blood" page (search all donors)
     │── css/style.css              -> Styling
     └── js/
          │── auth.js               -> Handles login & register forms
          │── dashboard.js            -> Handles user dashboard + change password
          │── admin.js                 -> Handles admin panel + stats
          └── donors.js                 -> Handles Need Blood search page
```

## Latest Addition: Mark as Available to Donate

- On the **Dashboard**, there's now a "Donation Availability" section with a button: **"Mark as Available"** / **"Mark as Unavailable"**. Users can toggle this any time.
- On the **Need Blood** page, every donor now has a **Yes/No "Available?"** column, and there's a checkbox to **show only donors available right now** — useful in an emergency.
- The **Admin Panel** table also shows this column, and admins can toggle any user's availability from the Edit form.
- **How it works:**
  - New database column: `is_available TINYINT(1) DEFAULT 0` on the `users` table (see `database.sql` — if you already created your table before this update, run the included `ALTER TABLE` line instead).
  - New route `PUT /api/me/availability` lets the logged-in user flip their own flag:
    ```sql
    UPDATE users SET is_available = ? WHERE id = ?;
    ```
  - The `/api/donors` and `/api/admin/users` routes now also select `is_available`, and donors are sorted with available donors first:
    ```sql
    SELECT name, blood_group, phone, address, last_donation_date, is_available
    FROM users ORDER BY is_available DESC, name ASC;
    ```
  - The admin's edit-user route also accepts and saves `is_available`, so an admin can toggle it for someone else if needed.

## What's New in This Version (3 Added Features)

### 1. "Need Blood" Page
- A **"Need Blood"** link is now in the top bar on the Dashboard, Admin Panel, and the new donors page itself.
- Clicking it opens `donors.html`, which lists every registered user's **name, blood group, phone, address, and last donation date**.
- There's a search box to filter the list by blood group (e.g. type "O-" to see only O- donors).
- **How it works:** the page calls a new backend route `GET /api/donors` (in `server.js`), which is open to **any logged-in user** (not just admin). It runs this SQL query:
  ```sql
  SELECT name, blood_group, phone, address, last_donation_date
  FROM users ORDER BY name ASC;
  ```
  The frontend (`public/js/donors.js`) fetches this list and renders it into a table, filtering client-side as the user types in the search box.

### 2. Change Password
- On the Dashboard page, below "My Details," there's now a **"Change Password"** form asking for the current password and a new password.
- **How it works:** submitting the form calls `PUT /api/me/password` (in `server.js`). The server:
  1. Looks up the logged-in user's current hashed password from the database.
  2. Uses `bcrypt.compareSync()` to verify the entered current password matches.
  3. If correct, hashes the new password with `bcrypt.hashSync()` and updates it:
     ```sql
     UPDATE users SET password = ? WHERE id = ?;
     ```
  4. Returns a success or error message, shown on the page without a full reload.

### 3. Blood Group Statistics (Admin Panel)
- At the top of the Admin Panel, there's now a **"Blood Group Statistics"** section showing small cards like `A+: 5 donors`, `O-: 2 donors`, etc.
- **How it works:** the admin panel calls a new route `GET /api/admin/stats` (admin-only), which runs:
  ```sql
  SELECT blood_group, COUNT(*) AS total
  FROM users
  WHERE blood_group IS NOT NULL AND blood_group <> ''
  GROUP BY blood_group
  ORDER BY total DESC;
  ```
  This uses SQL's `GROUP BY` and `COUNT()` to count how many users have each blood group. The result is rendered as small stat cards at the top of the page, and refreshes automatically whenever a user is edited or deleted.

## Step 1: Install Node.js
Download from https://nodejs.org (LTS version) if you don't have it.
Check installation:
```
node -v
npm -v
```

## Step 2: Create the Database
1. Open **MySQL Workbench 8.0 CE** and connect to your local server.
2. Open `database.sql` (File > Open SQL Script) or paste its contents into a new query tab.
3. Click the lightning bolt (Execute All) to run it.
   This creates the `blood_donation_db` database and a `users` table.

## Step 3: Set Your MySQL Password
Open `config/db.js` and change this line to your real MySQL root password:
```js
password: 'password',   // <-- change this
```

## Step 4: Install Dependencies
Open a terminal inside the `blood-final` folder:
```
npm install
```
This installs Express, MySQL2, express-session, and bcryptjs.

## Step 5: Run the Server
```
npm start
```
You should see:
```
Connected to MySQL database.
Server running at http://localhost:3000
```

## Step 6: Use the Website
Open your browser at:
```
http://localhost:3000
```

### Create the first (Admin) account
1. Go to the website and click **Register**. Create a normal account (e.g. your own email).
2. Every new registration is a normal user by default.
3. To make that account the admin, open MySQL Workbench and run:
```sql
USE blood_donation_db;
UPDATE users SET is_admin = 1 WHERE email = 'your_email_here@example.com';
```
4. Log out and log back in on the website with that account — you'll land on the **Admin Panel** automatically, with the blood group stats and full user table.

### Normal Users
- Register → Login → lands on their own **Dashboard**
- Can view/update their own details, and change their password
- Can click **"Need Blood"** to see all donors' contact details and search by blood group

### Admin
- Logs in → lands on the **Admin Panel**
- Sees **blood group statistics**, a table of all registered users, can edit/delete any account
- Can also visit "Need Blood" and "My Dashboard" like a normal user

## Troubleshooting
- **Error: Access denied for user 'root'** → wrong password in `config/db.js`.
- **Error: connect ECONNREFUSED** → MySQL server isn't running. Start it from MySQL Workbench or Windows Services ("MySQL80").
- **Port 3000 already in use** → change `const PORT = 3000;` in `server.js`.
- **Table doesn't exist** → re-run `database.sql` in MySQL Workbench.
- **Can't log in as admin** → make sure you ran the `UPDATE users SET is_admin = 1 ...` query and that you log out and log back in.

## For Your DBMS Report
This project demonstrates:
- **User authentication** (register/login/logout) with hashed passwords
- **Session-based access control** — regular users vs admin
- **CRUD operations** mapped to SQL:

| Operation | Where Used                     | SQL Statement |
|-----------|---------------------------------|----------------|
| Create    | Register new account            | INSERT INTO users ... |
| Read      | Dashboard / Admin panel / Need Blood | SELECT * FROM users |
| Update    | User edits own profile / password / Admin edits any user | UPDATE users SET ... WHERE id=? |
| Delete    | Admin removes a user             | DELETE FROM users WHERE id=? |

- **Role-based table design** using an `is_admin` flag in the `users` table.
- **Aggregate SQL queries** (`GROUP BY`, `COUNT()`) for the blood group statistics feature.
- **Password security** with bcrypt hashing, both at registration and when changing password.
