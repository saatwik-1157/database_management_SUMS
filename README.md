# SMART UNIVERSITY MANAGEMENT SYSTEM (SUMS) - ENTERPRISE V4

**Architect & Developer:** V.Saatwik Sairaam (24MIC 7131)  
**Version:** 4.2 (Graphics Edition)  
**Tech Stack:** MySQL, Vanilla JS (ES6+), CSS3 (Glassmorphism), Chart.js, FontAwesome

---

## 🚀 Overview
SUMS is an enterprise-scale university management ecosystem designed for VIT Global. It features a robust **MySQL back-end** managing 1,100+ entities and a **premium administrative dashboard** with real-time analytics.

### Key Functional Areas:
1.  **Academic Hub**: Holistic student registry with GPA and attendance tracking.
2.  **Faculty Suite**: Workload management and research publication tracking.
3.  **Career & Placements**: End-to-end recruitment drive tracking and analytics.
4.  **Campus Infrastructure**: Library loan management and hostel occupancy tracking.
5.  **Financials**: Automated payment triggers and scholarship ledger.

---

## 🛠️ Database Architecture
The system is built on a relational MySQL schema with advanced DBMS features:
-   **Triggers**: Automated capacity checks, book inventory updates, and fine calculations.
-   **Stored Procedures**: Complex logic for graduation eligibility and GPA aggregation.
-   **Views**: Analytics-ready data layers for faculty workload and student transcripts.
-   **ACID Compliance**: Built on the InnoDB storage engine for data integrity.

### SQL Setup Guide:
To initialize the database, run the scripts in the following order:
1.  `schema.sql` - Core table structures.
2.  `advanced_features.sql` - Placement & Infrastructure modules.
3.  `addons.sql` - Library, Hostel, & Research modules.
4.  `data_massive_v2.sql` - Scale simulations (1,000+ Students).
5.  `analytics.sql` - Views, Procedures, & Triggers.
6.  `verify.sql` - Integrity verification queries.

---

## 🖥️ Dashboard Features

### 🔹 Unified Master Hub
A single SPA (Single Page Application) that switches between **Admin**, **Student**, and **Faculty** portals seamlessly using a dynamic role-based navigation system.

### 🔹 Glassmorphism UI
A state-of-the-art interface using backdrop-blur effects, radial gradients, and fluid CSS transitions for a premium "Enterprise" feel.

### 🔹 Intelligent Analytics
Interactive charts powered by **Chart.js** that visualize:
-   Student growth trends.
-   Departmental performance.
-   Real-time CGPA progress.

---

## 📊 Scale & Performance
-   **Students**: 1,100 Active Records
-   **Faculty**: 120 Academic Staff
-   **Departments**: 4 Major Schools (CS, EE, ME, BA)
-   **Latency**: Simulated zero-latency relational lookups.

---
*Created for VIT Global University Academic Project - 2026*
