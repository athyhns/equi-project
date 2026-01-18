
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

```

1. **User Input:** Pengguna mengisi data di React.
2. **API Request:** Frontend mengirim data JSON via HTTP POST.
3. **Validasi:** FastAPI memvalidasi tipe data menggunakan Pydantic.
4. **Persistence:** Backend menyimpan data ke MongoDB secara *asynchronous*.
5. **Feedback:** UI diperbarui secara *real-time* (Single Page Application).

---

## ✨ Fitur Utama & Kompleksitas

1. **📱 Manajemen Langganan (CRUD)**
Create, Read, Update, dan Delete data langganan dengan update instan.
2. **💰 Split Bill Calculator (Logika Bisnis)**
Fitur kompleks untuk menghitung pembagian biaya. Backend otomatis menghitung *"Cost for Me"* (biaya pribadi) dan memisahkan tagihan teman.
3. **🔐 Sistem Otentikasi**
Login dan Register untuk membatasi akses data spesifik per user (Security).
4. **📅 Visualisasi Kalender**
Pemetaan tanggal tagihan ke dalam tampilan kalender interaktif.
5. **🌐 External API Integration**
Integrasi dengan API **Clearbit** untuk mengambil logo layanan (misal: Netflix/Spotify) secara otomatis.

---

## 📂 Struktur Direktori

```bash
/equi-project
├── /client               # Source code Frontend (React)
│   ├── /src
│   ├── Dockerfile        # Konfigurasi container Frontend
│   └── vite.config.js
├── /server               # Source code Backend (Python FastAPI)
│   ├── main.py           # Entry point & API Routes
│   ├── requirements.txt
│   └── Dockerfile        # Konfigurasi container Backend
└── docker-compose.yml    # Orkestrasi Client-Server-DB

```

---

## 🚀 Cara Menjalankan (Deployment)

Prasyarat: Pastikan **Docker Desktop** sudah terinstal dan berjalan (*Running*).

### 1. Build & Run

Buka terminal di root folder proyek, lalu jalankan perintah:

```bash
docker compose up --build

```

### 2. Akses Aplikasi

Tunggu hingga proses build selesai. Akses layanan melalui browser:

* **Frontend UI:** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Backend API Docs (Swagger):** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)

> **Catatan:** Database menggunakan **Docker Volume** (`mongo-data`), sehingga data aman dan tidak akan hilang meskipun container dimatikan.

---

Built with ❤️ by **Athiyah Naurah Syifa**
