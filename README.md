# Smart Campus Operations Hub

##  Overview

This project is developed for the **IT3030 – Programming Applications and Frameworks** assignment.

It is a full-stack web application designed to manage university operations including:

* Facility and asset bookings
* Maintenance and incident handling

The system provides a centralized platform with role-based access and workflow management.

---

##  Business Scenario

A university requires a modern system to:

* Manage rooms, labs, and equipment bookings
* Handle maintenance issues and incident reporting
* Provide role-based workflows and notifications

---

##  Features

###  Module A – Facilities & Assets Catalogue

* Manage resources (rooms, labs, equipment)
* Metadata: type, capacity, location, availability
* Search and filtering

###  Module B – Booking Management

* Request bookings (date, time, purpose)
* Booking workflow:

  * PENDING → APPROVED / REJECTED → CANCELLED
* Conflict prevention
* Admin approval system

###  Module C – Incident & Maintenance

* Create incident tickets
* Attach images (up to 3)
* Workflow:

  * OPEN → IN_PROGRESS → RESOLVED → CLOSED
* Technician assignment and updates

###  Module D – Notifications

* Booking updates
* Ticket status updates
* Comments notifications

###  Module E – Authentication & Authorization

* OAuth 2.0 login (Google)
* Role-based access:

  * USER
  * ADMIN
  * (Optional: TECHNICIAN)

---

##  Tech Stack

* Frontend: React / Expo
* Backend: Spring Boot (Java)
* Database: (MySQL / MongoDB – update yours)
* Authentication: OAuth 2.0
* Version Control: GitHub + GitHub Actions

---

##  Setup Instructions

###  Frontend

From project root:

* npm run frontend:install
* npm run dev

Or:

* cd frontend
* npm install
* npm run dev

---

###  Backend

From project root:

* ./mvnw spring-boot:run

---

##  System Workflow

### Booking Flow:

User → Request → Admin → Approve/Reject

### Ticket Flow:

User → Create Ticket → Technician → Resolve → Close

---

##  Testing & Quality

* API tested using Postman
* Validation and error handling implemented
* Clean architecture followed

---

##  Team Contribution

* Member 1: Facilities module
* Member 2: Booking module
* Member 3: Incident module
* Member 4: Auth & Notifications

---

##  Repository

GitHub repository with version control and CI workflow is used.
---

##  Notes

* Backend and frontend are there
* Secure API endpoints
* Maintainable code structure
