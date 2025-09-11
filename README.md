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