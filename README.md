# Schedula-API-Artisans
## Project Overview

This ER Diagram models the patient flow in the Schedula system, covering how patients book appointments, consult with doctors, and give feedback.

### Entities

* **Patient** – Stores patient details.
* **Doctor** – Stores doctor profiles & availability.
* **Appointment** – Connects patients and doctors.
* **Time Slot** – Stores a doctor’s available slots.
* **Chat, Feedback, Reminder, Review** – Manages the post-appointment flow.

### Relationships

* One patient can have many appointments.
* One doctor can have many appointments & time slots.
* Each appointment is linked to one chat, one feedback, and one review.

````markdown
# Schedula API (Internship Tasks)

This project is built with **NestJS** and demonstrates basic API development as part of internship tasks.

---

## 🚀 Features

- **Task 2:** Hello World API using NestJS
  - `GET /hello` → returns `{"message": "Hello World"}`

---

## 🛠️ Running the App

Start the development server:

```bash
npm run start:dev
```

By default, the app runs on **[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Endpoints

- **Hello World**

  ```
  GET /hello
  Response: { "message": "Hello World" }
  ```

---

## 📂 Project Structure

```
src/
 ├─ app.module.ts         # Root module
 ├─ main.ts               # Entry point
 └─ hello/
     └─ hello.controller.ts  # Hello World controller
```

---
````
