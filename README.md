# 💸 EQUI - Subscription Management System

![React](https://img.shields.io/badge/Frontend-React_JS-blue?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?logo=docker&logoColor=white)

**TUGAS BESAR: INTEGRASI APLIKASI ENTERPRISE**
* **Nama Proyek:** Equi - Subscription Management System
* **Mahasiswa:** Athiyah Naurah Syifa

---

## 📖 Deskripsi Proyek

**Equi** adalah aplikasi berbasis web yang dirancang untuk membantu pengguna mengelola langganan bulanan (seperti Netflix, Spotify, iCloud) dan memantau pengeluaran rutin secara efisien.

Sistem ini dibangun dengan pendekatan arsitektur **Microservices** yang *ter-containerized*. Setiap komponen (Frontend, Backend, dan Database) berjalan pada lingkungan terisolasi namun saling terintegrasi melalui jaringan internal Docker.

---

## 🛠️ Arsitektur & Tech Stack

Aplikasi ini terdiri dari tiga layanan utama yang diorkestrasi menggunakan **Docker Compose**:

| Service | Teknologi | Port | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Frontend** | React JS (Vite) + Tailwind CSS | `5173` | UI Interaktif, State Management, HTTP Requests. |
| **Backend** | Python (FastAPI) + Motor | `8000` | API Gateway, Validasi Pydantic, Logika Split Bill. |
| **Database** | MongoDB (NoSQL) | `27017` | Penyimpanan Data Persisten (User, Transaksi). |

---

## 🔄 Alur Integrasi Data (Data Flow)

Berikut adalah visualisasi alur data ketika pengguna menambahkan langganan baru:

```text
+--------+           +----------+           +----------+           +---------+
|  USER  |           | FRONTEND |           | BACKEND  |           | DATABASE|
| (User) |           | (React)  |           | (FastAPI)|           | (Mongo) |
+--------+           +----------+           +----------+           +---------+
    |                     |                      |                      |
    |--- Input Data ----->|                      |                      |
    |                     |---- POST (JSON) ---->|                      |
    |                     |                      |--- Validasi Data --->|
    |                     |                      |                      |
    |                     |                      |---- Insert Data ---->|
    |                     |                      |<--- Acknowledge -----|
    |                     |<----- 200 OK --------|                      |
    |<-- Update UI -------|                      |                      |
    |   (Real-time)       |                      |                      |
