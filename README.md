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
# Schedula API - NestJS + TypeORM + PostgreSQL

## Project Overview
Schedula API is a backend application built with **NestJS** using **TypeORM** to interact with a **PostgreSQL** database.  
It manages **Users, Doctors, and Patients** entities, providing a solid foundation for scheduling and healthcare-related functionality.

---

## Features
- User management with roles: `admin`, `doctor`, `patient`
- Doctor and Patient profiles linked to Users
- Database migrations with TypeORM
- PostgreSQL integration
- Ready for further development (appointments, authentication, etc.)

---

## Tech Stack
- **Backend Framework:** NestJS
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Language:** TypeScript
- **Environment Management:** dotenv

---

## Prerequisites
- Node.js v18+
- PostgreSQL installed and running
- npm installed
- Optional: pgAdmin for database visualization

---

## Setup

### 1. Clone the repository
```bash
git clone <repository_url>
cd Schedula-API-Artisans



# Task 4 – Google OAuth Role-Based Authentication

## 🎯 Objective

Implement authentication in NestJS using **Google OAuth** with **role-based access** (`doctor` | `patient`).

---

## 🛠 Tech

* NestJS + Passport.js
* `passport-google-oauth20`, `@nestjs/jwt`
* Any DB (Postgres/Mongo) for user persistence

---

## 🧱 User Schema

```ts
{
  id: string;
  email: string;
  name: string;
  provider: 'google';
  password: null;
  role: 'doctor' | 'patient';
}
```

---

## ⚙️ Setup

### 1. Install

```bash
npm i @nestjs/passport passport passport-google-oauth20 @nestjs/jwt passport-jwt
npm i -D @types/passport-google-oauth20
```

### 2. Google OAuth Credentials

1. Create project in [Google Cloud Console](https://console.cloud.google.com).
2. Enable **Google People API**.
3. Configure **OAuth consent screen** (Branding → Scopes → Audience=External → Contact).
4. Create **OAuth Client ID**:

   * Application Type = Web App
   * **Authorized origins** → `http://localhost:3000`
   * **Redirect URI** → `http://localhost:3000/api/v1/auth/google/callback`
5. Copy **Client ID & Secret**.

### 3. `.env`

```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
JWT_SECRET=supersecretkey
```

---

## 🚀 API Endpoints

| Method | Endpoint                           | Purpose                      |
| ------ | ---------------------------------- | ---------------------------- |
| GET    | `/api/v1/auth/google?role=doctor`  | Start Google login (doctor)  |
| GET    | `/api/v1/auth/google?role=patient` | Start Google login (patient) |
| GET    | `/api/v1/auth/google/callback`     | Handle Google callback → JWT |

---

## 🔐 Flow

1. User hits `/auth/google?role=doctor`.
2. Redirects to Google login.
3. Callback → extract profile.
4. If user exists → login. Else → create user with role.
5. Issue **JWT** containing `{ id, email, role }`.

---

## 📂 Structure

```
src/
 ┣ auth/
 ┃ ┣ auth.controller.ts
 ┃ ┣ auth.service.ts
 ┃ ┣ google.strategy.ts
 ┃ ┗ google-auth.guard.ts
 ┣ users/
 ┃ ┣ users.service.ts
 ┃ ┗ users.entity.ts
```

---
## System-Generated Wave Schedule Creation

### Endpoint
`POST /api/v1/doctors/{doctorId}/schedule`

### Description
Creates a **system-generated wave schedule** for a doctor.  
This defines a block of consulting time, slot duration, and capacity per slot.  
**Slots are not stored in the database**—they are generated dynamically based on the schedule parameters.

### Request Body Example
```json
{
  "scheduleType": "wave",
  "waveMode": "system",
  "date": "2025-09-22",
  "consultingStart": "09:00:00",
  "consultingEnd": "12:00:00",
  "slotDuration": 30,
  "capacityPerSlot": 5
}

## Doctor Available Slots

### GET `/api/v1/doctors/{doctorId}/available-slots`

Retrieves the available time slots for a specific doctor on a given date. This endpoint dynamically generates the slots based on the doctor's scheduling rules.

-   **Query Parameters:**
    -   `date` (string, required): The date to check for availability in `YYYY-MM-DD` format.

-   **Success Response (200 OK):**

    ```json
    {
        "doctorId": "doctor-uuid",
        "date": "2025-09-29",
        "slots": [
            {
                "slotId": "doctor-uuid-20250929-0900",
                "startTime": "09:00",
                "endTime": "09:30",
                "capacity": 4,
                "available": 4
            },
            {
                "slotId": "doctor-uuid-20250929-0930",
                "startTime": "09:30",
                "endTime": "10:00",
                "capacity": 4,
                "available": 3
            }
        ]
    }
    ```

    ## Confirm Appointment

### POST `/api/v1/appointments/confirm`

Books an available time slot for the authenticated patient. This endpoint is transactional and validates slot capacity in real-time to prevent overbooking.

-   **Authorization:** Patient's JWT Token required.

-   **Request Body:**

    ```json
    {
        "slotId": "{doctorId}-{date}-{startTime}"
    }
    ```

-   **Success Response (201 Created):**
    Returns the full, newly created appointment object.


    ## Get Appointment Details

### GET `/api/v1/appointments/{id}`

Retrieves the full details for a single appointment, including the associated doctor and patient information.

-   **Success Response (200 OK):**

    ```json
    {
        "id": "appointment-uuid",
        "status": "confirmed",
        "assigned_date": "2025-09-25",
        "assigned_time": "09:00",
        "doctor": {
            "id": "doctor-uuid",
            "name": "Dr. Susan Bones",
            "specialization": "Orthopedics",
            ...
        },
        "patient": {
            "id": "patient-uuid",
            "name": "John Doe",
            ...
        }
    }
    ```
    ## List Patient Appointments

### GET `/api/v1/appointments`

Retrieves a list of appointments for the authenticated patient. This endpoint supports filtering by status.

-   **Authorization:** Patient's JWT Token required.

-   **Query Parameters:**
    -   `status` (string, optional): Filter the appointments. Can be one of `upcoming`, `past`, or `cancelled`.

-   **Success Response (200 OK):**
    Returns an array of appointment objects that match the filter criteria.

    ```json
    [
        {
            "id": "appointment-uuid",
            "status": "confirmed",
            "assigned_date": "2025-09-27",
            "assigned_time": "09:00",
            "doctor": {
                "id": "doctor-uuid",
                "name": "Dr. Susan Bones",
                ...
            },
            "patient": {
                "id": "patient-uuid",
                "name": "John Doe",
                ...
            }
        }
    ]
    ```
    ## Register a New Doctor (Admin Only)

### POST `/api/v1/auth/register-doctor`

Securely creates a new doctor account. This is a protected endpoint and can only be accessed by an authenticated administrator.

-   **Authorization:** Admin's JWT Token required.

-   **Request Body:**

    ```json
    {
        "email": "new.doctor@example.com",
        "password": "DoctorPassword123",
        "name": "Dr. Emily Carter",
        "specialization": "Pediatrics",
        "location": "Mumbai",
        "schedule_type": "wave"
    }
    ```

-   **Success Response (201 Created):**
    Returns the newly created user and doctor profile objects.

    ## Create Manual Doctor Slots

### POST `/api/v1/doctors/{doctorId}/slots`

Allows an authenticated doctor to create specific, manually-defined time slots for a given day. This provides granular control over their availability.

-   **Authorization:** Doctor's JWT Token required.

-   **Request Body:**

    ```json
    {
        "date": "2025-09-26",
        "slots": [
            {
                "startTime": "10:00",
                "endTime": "10:20",
                "capacity": 1
            },
            {
                "startTime": "11:00",
                "endTime": "11:30",
                "capacity": 3
            }
        ]
    }
    ```

-   **Success Response (201 Created):**
    Returns an array of the newly created slot objects.
