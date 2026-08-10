# 🩸 Blood Donor Management System

A simple web-based platform for managing university blood donor information, built as a Database Management System (DBMS) course project.

---
## Project Setup

Step-1 - npm install
step-2 - npm start

## 📌 Project Information

| | |
|---|---|
| **Project Title** | Blood Donor Management System |
| **Course** | Database Management System (DBMS) |
| **Institution** | Northern University Bangladesh |

### 👨‍💻 Team Members

| Name | Student ID |
|---|---|
| Md. Abdhulla Al Noman | 42250302998 |
| Md. Mehedi Hasan | 42240301890 |

---

## 1. Introduction

The **Blood Donor Management System** is a lightweight, web-based application designed to help university students register as blood donors and allow administrators to manage and monitor donor records. The system provides a simple authentication mechanism for two types of users — **Donors** and **Admins** — and maintains a centralized, searchable donor list backed by a relational database.

This project is scoped as a compact, course-friendly application so that core DBMS concepts such as schema design, normalization, and CRUD operations can be implemented and demonstrated clearly within a limited timeframe.

---

## 2. Problem Statement

Universities often lack a centralized, easy-to-access record of students willing to donate blood. When an emergency arises, locating a donor with a specific blood group quickly becomes difficult, especially without a structured, searchable system. There is a need for a simple platform where:

- Students can register themselves as donors and keep their information up to date.
- Administrators can view, manage, and verify donor records.
- Anyone needing a donor can quickly identify available donors by blood group.

---

## 3. Objectives

- Design a simple, normalized relational database to store donor information.
- Implement basic authentication for two user roles: **Donor** and **Admin**.
- Allow donors to register and manage their own profile data.
- Allow admins to view, update, and manage the complete donor list.
- Display a clean, organized donor directory with key details visible at a glance.

---

## 4. Scope and Modules

The system is divided into three core modules:

### 4.1 Authentication Module
Handles registration and login for both **Donors** and **Admins**. Basic credential checks (username/email and password) determine access level — donors can manage only their own data, while admins can view and manage all donor records.

### 4.2 Donor Profile Module
Allows a logged-in donor to create their profile and add or update their personal and donation-related information, including blood group, contact details, and donation history.

### 4.3 Donor List Module
Displays all registered donors in a structured table, viewable by admins (and optionally other logged-in users), to make finding a suitable donor quick and easy.

---

## 5. System Design Overview

### 5.1 Donor List — Display Fields

The donor list page shows the following information for each registered donor:

| SL | Name | Student ID | Phone Number | Blood Group | Email | Last Donation Date | Times Donated |
|----|------|------------|--------------|--------------|-------|----------------------|----------------|
| 1  | —    | —          | —            | —            | —     | —                    | —              |

### 5.2 Database Design (Proposed)

| Table | Key Fields | Purpose |
|---|---|---|
| **Users** | `user_id` (PK), `role` (donor/admin), `email` (unique), `password` | Stores login credentials and role for access control |
| **Donors** | `donor_id` (PK), `user_id` (FK → Users), `name`, `student_id`, `phone`, `blood_group`, `last_donation_date`, `donation_count` | Stores donor profile and donation details |

**Relationship:** One `User` account (role: donor) is linked to one `Donor` profile — a one-to-one relationship enforced via foreign key.

### 5.3 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Node.js, express js |
| **Database** | MySQL |


---

## 6. Expected Outcome

A functional web application where:
- Donors can register, log in, and manage their own profile.
- Admins can log in and view the complete donor directory.
- Blood group and contact information are easily accessible for emergency donor lookup.

---

## 7. Project Timeline

| Phase | Activities | Duration |
|---|---|---|
| 1 | Requirement analysis & database schema design | Week 1 |
| 2 | Database setup & Authentication module | Week 2 |
| 3 | Donor Profile module development | Week 3 |
| 4 | Donor List module + frontend integration | Week 4 |
| 5 | Testing, debugging & documentation | Week 5 |

---

## 8. Conclusion

The Blood Donor Management System is a simple, practical project that demonstrates core database management concepts — schema design, authentication, and CRUD operations — while solving a real, relatable problem for a university community.

---

*Northern University Bangladesh | DBMS Course Project | Blood Donor Management System*
