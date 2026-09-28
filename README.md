<div align="center">

# 🏛️ AssetPulse

### Advanced Government Asset Management & Immutable Audit Ledger

**A centralized, secure, and transparent platform for managing government infrastructure assets across their complete lifecycle.**

<p>
  <a href="https://asset-pulse-zeta.vercel.app">🌐 Live Demo</a> ·
  <a href="https://github.com/PremPatel64/AssetPulse">💻 GitHub</a> ·
  <a href="#features">✨ Features</a> ·
  <a href="#architecture">🏗️ Architecture</a>
</p>

<br/>

**Track Assets • Monitor Health • Manage Maintenance • Verify Every Change**

</div>

---

## 📌 Overview

**AssetPulse** is an enterprise-grade **Government Infrastructure Asset Management Platform** designed to help government organizations digitally manage physical assets throughout their entire lifecycle.

Government departments manage thousands of assets across multiple locations, including:

* 🏢 Government buildings
* 🛣️ Roads and bridges
* 🏥 Hospitals and healthcare infrastructure
* 🏫 Schools and educational facilities
* 💧 Water infrastructure
* ⚡ Electrical infrastructure
* 🚇 Public transportation infrastructure
* 🖥️ IT and communication equipment
* 🚜 Government vehicles and machinery
* 🏗️ Construction and public infrastructure projects

Managing these assets using disconnected spreadsheets, paper records, and department-specific systems can make it difficult to answer basic questions:

> **Where is an asset? Who is responsible for it? What is its current condition? How much has been spent on it? When was it last maintained? Has any record been modified?**

AssetPulse addresses these challenges through a centralized digital platform that combines:

**Asset Inventory + Lifecycle Management + Maintenance + Risk Monitoring + Role-Based Access + Cryptographic Audit Ledger**

---

# 🎯 Problem Statement

Government infrastructure assets often have long lifecycles and involve multiple departments, contractors, technicians, managers, and auditors.

Traditional asset-management processes can create several challenges:

| Challenge                         | Impact                                            |
| --------------------------------- | ------------------------------------------------- |
| Fragmented asset records          | Difficult to obtain a complete portfolio view     |
| Spreadsheet-based tracking        | Manual errors and duplicate records               |
| Poor maintenance visibility       | Preventive maintenance can be missed              |
| Lack of centralized ownership     | Difficult to identify responsible departments     |
| Limited auditability              | Changes may be difficult to verify                |
| Manual transfer records           | Asset movement can become difficult to track      |
| No real-time portfolio visibility | Management decisions rely on outdated information |
| Weak historical records           | Difficult to reconstruct an asset's lifecycle     |
| Low-connectivity field locations  | Technicians may struggle to update records        |
| Limited risk visibility           | High-risk assets may not receive timely attention |

---

# 💡 Our Solution

**AssetPulse creates a single digital source of truth for government assets.**

The platform follows an asset throughout its complete lifecycle:

```text
Procurement
    ↓
Registration
    ↓
Deployment
    ↓
Operation
    ↓
Inspection
    ↓
Maintenance
    ↓
Transfer
    ↓
Renovation / Upgrade
    ↓
Decommissioning
    ↓
Disposal
```

Every important lifecycle event is recorded and linked to the asset's history.

In addition, AssetPulse maintains a **cryptographically linked event ledger** so that historical records can be independently verified for integrity.

---

# ✨ Core Features

## 📊 1. Government Control Room

A centralized dashboard provides decision-makers with a real-time overview of the complete asset portfolio.

### Key indicators

* Total number of assets
* Total portfolio value
* Asset Health Index
* Assets requiring attention
* Maintenance due
* Overdue maintenance
* High-risk assets
* Depreciation
* Department-wise distribution
* Location-wise distribution
* Asset lifecycle status

### Example dashboard

```text
┌─────────────────────────────────────────────────────────┐
│                 GOVERNMENT CONTROL ROOM                 │
├──────────────┬──────────────┬──────────────┬───────────┤
│ Total Assets │ Portfolio    │ Health Index │ High Risk │
│    12,482    │   ₹4.82B     │     87%      │    126    │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  Asset Distribution        Asset Health                │
│  ───────────────────       ────────────────             │
│  Buildings       32%       Healthy       72%           │
│  Roads           24%       Attention     19%           │
│  Equipment       21%       Critical       9%           │
│  Vehicles        13%                                      │
│  Other           10%                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

# 🔗 2. Immutable Cryptographic Ledger

One of the core features of AssetPulse is its **Event-Sourced Immutable Ledger**.

Instead of storing only the latest state of an asset, the platform records important events such as:

* Asset creation
* Asset assignment
* Department transfer
* Location transfer
* Inspection
* Maintenance
* Cost update
* Ownership change
* Status change
* Disposal

Each event contains a cryptographic hash.

Conceptually:

```text
Event 1
   │
   ├── Previous Hash: 000000
   ├── Event Data
   └── Hash: A1B2C3
          │
          ▼
Event 2
   │
   ├── Previous Hash: A1B2C3
   ├── Event Data
   └── Hash: D4E5F6
          │
          ▼
Event 3
   │
   ├── Previous Hash: D4E5F6
   ├── Event Data
   └── Hash: G7H8I9
```

The hash of each event depends on:

```text
Current Event Data
+
Previous Event Hash
=
Current Event Hash
```

This creates a **tamper-evident chain**.

If an old event is modified, its hash changes and the following chain no longer matches.

### Ledger Audit

AssetPulse provides a full-chain verification mechanism that:

1. Reads every ledger event.
2. Recomputes the SHA-256 hash.
3. Compares it with the stored hash.
4. Verifies the `previousHash` relationship.
5. Detects broken links.
6. Reports integrity violations.

Example:

```text
╔══════════════════════════════════════════════╗
║          IMMUTABLE LEDGER AUDIT              ║
╠══════════════════════════════════════════════╣
║ Events Checked             12,482            ║
║ Valid Hashes               12,482            ║
║ Broken Links                    0            ║
║ Tampered Events                0             ║
║ Missing Events                 0             ║
║                                              ║
║ STATUS: ✓ LEDGER VERIFIED                    ║
╚══════════════════════════════════════════════╝
```

> **Important:** This is a cryptographic tamper-evident ledger, not a public blockchain. It is designed to provide verifiable integrity within the government asset-management system.

---

# 🛠️ 3. Complete Asset Lifecycle Management

Each asset has a complete digital lifecycle record.

### Asset Profile

An asset can contain:

* Asset ID
* Asset name
* Asset category
* Department
* Location
* GPS coordinates
* Current custodian
* Acquisition date
* Acquisition cost
* Current book value
* Condition
* Risk level
* Warranty
* Maintenance schedule
* Documents
* Photos
* Current status

### Lifecycle States

```text
PROPOSED
   ↓
PROCURED
   ↓
ACTIVE
   ↓
UNDER MAINTENANCE
   ↓
TRANSFERRED
   ↓
RETIRED
   ↓
DISPOSED
```

This allows government departments to understand not only **what assets they own**, but also **what happened to each asset throughout its lifecycle**.

---

# 🏢 4. Department & Location Management

AssetPulse can organize assets across:

```text
Government
│
├── Departments
│   ├── Public Works
│   ├── Health
│   ├── Education
│   ├── Transport
│   └── Water Resources
│
├── Regions
│   ├── State
│   ├── District
│   └── City
│
└── Sites
    ├── Offices
    ├── Hospitals
    ├── Schools
    ├── Roads
    └── Infrastructure Facilities
```

This makes it possible to analyze assets by:

* Department
* Region
* District
* Site
* Asset category
* Responsible authority

---

# 🔧 5. Preventive Maintenance Engine

AssetPulse helps organizations move from **reactive maintenance** to **preventive maintenance**.

The system tracks:

* Upcoming maintenance
* Overdue maintenance
* Maintenance frequency
* Last maintenance date
* Next maintenance date
* Maintenance cost
* Technician
* Maintenance history
* Asset downtime

### Maintenance workflow

```text
Asset
  ↓
Maintenance Schedule
  ↓
Upcoming Reminder
  ↓
Technician Assignment
  ↓
Inspection
  ↓
Maintenance
  ↓
Cost & Work Log
  ↓
Ledger Event
  ↓
Next Maintenance Date
```

This creates a continuous maintenance history for every asset.

---

# 📱 6. Field Mode

Government infrastructure is often distributed across large geographical areas where network connectivity may be unreliable.

AssetPulse is designed with a **Field Mode / PWA-ready architecture**.

Field workers can potentially:

* Search assets
* Scan asset identifiers
* View asset information
* Record inspections
* Update condition
* Record maintenance
* Capture field information
* Queue changes while offline
* Synchronize when connectivity returns

### Offline architecture

```text
             FIELD DEVICE
                  │
          ┌───────▼───────┐
          │   AssetPulse  │
          │    PWA App    │
          └───────┬───────┘
                  │
          ┌───────▼───────┐
          │   IndexedDB   │
          │ Offline Queue │
          └───────┬───────┘
                  │
             Connection
               Restored
                  │
          ┌───────▼───────┐
          │ Synchronize   │
          │ Changes       │
          └───────────────┘
```

---

# 🛡️ 7. Role-Based Access Control

AssetPulse separates responsibilities using **RBAC**.

| Role         | Responsibilities                            |
| ------------ | ------------------------------------------- |
| `ADMIN`      | System configuration, users, permissions    |
| `MANAGER`    | Asset management, transfers, approvals      |
| `TECHNICIAN` | Inspections and maintenance updates         |
| `AUDITOR`    | Ledger verification and historical auditing |

Example:

```text
ADMIN
 ├── Manage users
 ├── Manage departments
 ├── Manage assets
 └── Configure system

MANAGER
 ├── View assets
 ├── Transfer assets
 ├── Approve operations
 └── Monitor maintenance

TECHNICIAN
 ├── Inspect assets
 ├── Update condition
 └── Record maintenance

AUDITOR
 ├── View historical events
 ├── Verify ledger
 └── Generate audit reports
```

This follows the principle of **least-privilege access**, where users receive only the permissions required for their responsibilities.

---

# 📈 8. Asset Health Index

AssetPulse introduces an **Asset Health Index (AHI)** to provide a simplified view of asset condition.

The index can consider factors such as:

```text
Asset Health
     │
     ├── Physical Condition
     ├── Maintenance History
     ├── Age
     ├── Failure History
     ├── Inspection Results
     └── Operational Status
```

The resulting score helps management identify assets that may require inspection, maintenance, rehabilitation, or replacement.

> The AHI is a decision-support metric and does not replace professional engineering inspection.

---

# ⚠️ 9. Risk Monitoring

Assets can be categorized according to operational or maintenance risk.

Example risk factors:

* Poor physical condition
* Repeated failures
* Overdue maintenance
* High replacement cost
* Critical infrastructure role
* Long downtime
* Aging equipment

Example:

```text
LOW
████████████████████

MEDIUM
████████████

HIGH
██████

CRITICAL
███
```

Management can therefore focus attention on assets requiring closer monitoring.

---

# 💰 10. Financial & Depreciation Tracking

AssetPulse can maintain financial information such as:

* Acquisition cost
* Current book value
* Depreciation
* Maintenance expenditure
* Repair cost
* Replacement estimate
* Lifecycle cost

This enables departments to understand the financial impact of maintaining infrastructure.

Example:

```text
Acquisition Cost       ₹50,00,000
Maintenance Cost       ₹8,40,000
Current Book Value     ₹31,20,000
Estimated Replacement  ₹65,00,000
```

---

# 🔍 11. Complete Audit Trail

Every important operation can produce an event.

Example:

```json
{
  "eventType": "ASSET_TRANSFER",
  "assetId": "AST-10245",
  "fromDepartment": "Health",
  "toDepartment": "Public Works",
  "performedBy": "manager-204",
  "timestamp": "2026-09-28T10:42:00Z",
  "previousHash": "8d7a...",
  "hash": "f32b..."
}
```

This creates a chronological history of asset activity.

Auditors can investigate:

* Who performed an operation?
* What changed?
* When did it happen?
* What was the previous state?
* Which department was responsible?
* Does the event chain remain valid?

---

# 🏗️ Architecture

AssetPulse follows a modular architecture designed to support future expansion into a production government infrastructure platform.

```text
                    ┌──────────────────────┐
                    │      Users           │
                    │ Admin / Manager      │
                    │ Technician / Auditor │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      React 19        │
                    │       Vite           │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
             Dashboard      Assets       Ledger
                 │             │             │
                 └─────────────┼─────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    API / Services    │
                    │       Express        │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       Asset Service     Maintenance       Ledger Service
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Persistent Data    │
                    │ MongoDB / Database   │
                    └──────────────────────┘
```

---

# 💻 Technology Stack

## Frontend

| Technology   | Purpose                       |
| ------------ | ----------------------------- |
| React 19     | UI development                |
| Vite         | Development and build tooling |
| Tailwind CSS | Styling                       |
| Zustand      | Global state management       |
| Recharts     | Data visualization            |
| Lucide React | Interface icons               |

## Backend

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| Node.js            | Runtime                     |
| Express.js         | REST API                    |
| Axios              | API communication           |
| Custom API Adapter | Development/mock data layer |

## Data & Security

| Technology      | Purpose               |
| --------------- | --------------------- |
| SHA-256         | Ledger hashing        |
| IndexedDB       | Offline field data    |
| Service Workers | PWA/offline support   |
| RBAC            | Permission management |

## Deployment

| Technology           | Purpose               |
| -------------------- | --------------------- |
| Vercel               | Production deployment |
| GitHub               | Source control        |
| Serverless Functions | Backend execution     |

---

# 📂 Project Structure

```text
AssetPulse/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── store/
│   │   ├── data/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── package.json
│
├── vercel.json
└── README.md
```

---

# 🔌 API Design

The architecture is organized around domain-specific APIs.

### Portfolio

```http
GET /api/portfolio
GET /api/portfolio/summary
GET /api/portfolio/health
GET /api/portfolio/risk
```

### Assets

```http
GET    /api/assets
GET    /api/assets/:id
POST   /api/assets
PUT    /api/assets/:id
DELETE /api/assets/:id
```

### Maintenance

```http
GET  /api/maintenance
POST /api/maintenance
GET  /api/maintenance/upcoming
GET  /api/maintenance/overdue
```

### Ledger

```http
GET  /api/ledger
GET  /api/ledger/:assetId
POST /api/ledger/verify
```

---

# 🔐 Ledger Verification Algorithm

The core verification process can be represented as:

```text
START
  │
  ▼
Load all ledger events
  │
  ▼
Sort events chronologically
  │
  ▼
Read previousHash
  │
  ▼
Recalculate SHA-256
  │
  ▼
Compare calculated hash
with stored hash
  │
  ├── ❌ Mismatch ──→ Integrity Violation
  │
  └── ✓ Match
         │
         ▼
Check previousHash
against previous event
         │
         ├── ❌ Broken Link
         │
         └── ✓ Valid
                │
                ▼
        Verify next event
                │
                ▼
             Complete
                │
                ▼
       Generate Audit Report
```

---

# 🧪 Current Deployment Mode

The current `main` branch is optimized for **zero-configuration serverless deployment**.

The deployed demonstration currently uses a **frontend-compatible mock API/data layer**, allowing the complete dashboard and user experience to be demonstrated without requiring developers to configure a MongoDB cluster.

This provides:

* No database setup for demo
* No environment variables required
* Fast local setup
* Simple Vercel deployment
* Reproducible hackathon demonstration

### Production Evolution

For a production deployment, the mock data layer can be replaced with:

```text
Mock Data
    ↓
Production REST API
    ↓
Database
    ↓
Authentication
    ↓
Government Identity Provider
    ↓
Encrypted Infrastructure
```

---

# 🚀 Quick Start

## Prerequisites

Make sure you have:

* Node.js 18+
* npm
* Git

Check your installation:

```bash
node --version
npm --version
git --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/PremPatel64/AssetPulse.git
```

```bash
cd AssetPulse
```

---

## 2. Install Dependencies

```bash
cd client
npm install
```

---

## 3. Start Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

# 🌐 Live Demo

### 🚀 AssetPulse

**Live Application:**

https://asset-pulse-zeta.vercel.app

The live demonstration showcases the main AssetPulse workflow including:

* Government control room
* Asset portfolio
* Asset details
* Maintenance monitoring
* Risk visualization
* Immutable ledger
* Ledger verification
* Role-based interface

---

# ☁️ Vercel Deployment

AssetPulse is configured for easy deployment on Vercel.

### Step 1

Create or log into your Vercel account.

### Step 2

Import the GitHub repository:

```text
PremPatel64/AssetPulse
```

### Step 3

Vercel detects the Vite application and uses the repository configuration.

### Step 4

Deploy the project.

For the current demonstration configuration:

```text
Environment Variables Required: None
Database Configuration Required: None
```

---

# 🧭 Main User Workflows

## Government Manager

```text
Login
 ↓
Control Room
 ↓
View Portfolio
 ↓
Identify High-Risk Assets
 ↓
Open Asset
 ↓
Review Health & Maintenance
 ↓
Assign Action
 ↓
Track Result
```

## Technician

```text
Open Field Mode
 ↓
Find / Scan Asset
 ↓
View Asset Information
 ↓
Perform Inspection
 ↓
Record Condition
 ↓
Add Maintenance Record
 ↓
Synchronize
```

## Auditor

```text
Open Audit Center
 ↓
Select Asset / Portfolio
 ↓
Load Event History
 ↓
Run Ledger Verification
 ↓
Recalculate Hashes
 ↓
Check Chain Integrity
 ↓
Generate Audit Result
```

---

# 🔒 Security Design

AssetPulse is designed around several security principles:

### Role-Based Authorization

Users receive permissions based on their responsibilities.

### Cryptographic Integrity

SHA-256 hashing provides tamper-evident event chaining.

### Auditability

Important operations are recorded as historical events.

### Least Privilege

Users should only access functionality required for their role.

### Separation of Responsibilities

Administrative, operational, technical, and auditing activities are separated.

---

# 📊 Example Asset Lifecycle

Consider a government hospital generator.

```text
Asset Created
     ↓
GEN-00482
     ↓
Purchased for ₹12,00,000
     ↓
Assigned to District Hospital
     ↓
Installed
     ↓
Monthly Inspection
     ↓
Preventive Maintenance
     ↓
Component Replaced
     ↓
Maintenance Cost Recorded
     ↓
Asset Transferred
     ↓
Inspection
     ↓
Retirement
     ↓
Disposal
```

Every major event becomes part of the asset's historical record.

This allows an auditor to reconstruct the asset's lifecycle from acquisition to disposal.

---

# 📈 Future Roadmap

AssetPulse is designed as a foundation that can be expanded into a full-scale government asset ecosystem.

### Phase 1 — Current

* [x] Government asset dashboard
* [x] Asset inventory
* [x] Asset lifecycle
* [x] Maintenance tracking
* [x] Risk monitoring
* [x] Cryptographic ledger
* [x] Ledger verification
* [x] RBAC interface
* [x] Vercel deployment

### Phase 2 — Production Infrastructure

* [ ] MongoDB/PostgreSQL integration
* [ ] Secure authentication
* [ ] Government SSO integration
* [ ] Real-time notifications
* [ ] Document management
* [ ] Advanced audit reports
* [ ] Multi-tenant department architecture

### Phase 3 — Field Intelligence

* [ ] QR/NFC asset identification
* [ ] Offline-first synchronization
* [ ] GPS-based asset verification
* [ ] Mobile/PWA application
* [ ] Field image capture
* [ ] Digital inspection forms

### Phase 4 — Intelligent Asset Management

* [ ] Predictive maintenance
* [ ] Failure probability analysis
* [ ] Remaining useful life estimation
* [ ] AI-assisted inspection
* [ ] Automated anomaly detection
* [ ] Maintenance cost forecasting

### Phase 5 — Government Infrastructure Intelligence

```text
                    AssetPulse
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
  Asset Data       Financial Data    Operational Data
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                Infrastructure
                 Intelligence
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Planning       Budgeting     Maintenance
```

---

# 🏛️ Why AssetPulse?

AssetPulse is more than an asset list.

It connects four important areas of infrastructure management:

```text
                ┌─────────────────────┐
                │    ASSETPULSE       │
                └──────────┬──────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   VISIBILITY          ACCOUNTABILITY       INTEGRITY
       │                   │                   │
       │                   │                   │
  Asset Dashboard      RBAC & Audit       Hash Ledger
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  BETTER ASSET MANAGEMENT
```

The goal is to provide government organizations with a **single, transparent, auditable view of infrastructure assets throughout their complete lifecycle.**

---

# 🎓 Hackathon Value Proposition

AssetPulse addresses the hackathon problem through a combination of:

### 1. Centralized Asset Intelligence

A unified view of assets across departments and locations.

### 2. Lifecycle Visibility

Every asset can be tracked from acquisition to disposal.

### 3. Preventive Maintenance

Maintenance schedules and risk indicators help identify assets requiring attention.

### 4. Cryptographic Accountability

A hash-linked event ledger makes historical changes independently verifiable.

### 5. Field Accessibility

PWA/offline architecture supports users working in infrastructure locations with unreliable connectivity.

### 6. Role-Based Governance

Different users receive appropriate operational and auditing capabilities.

---

# ⚠️ Production Considerations

The current application is a **hackathon/demo implementation**.

A production government deployment would require additional controls, including:

* Strong authentication and government SSO
* Production database infrastructure
* Encryption at rest and in transit
* Key management
* Comprehensive authorization
* Immutable external backups
* High availability
* Disaster recovery
* Security audits
* Penetration testing
* Detailed compliance requirements
* Data retention policies
* Centralized logging and monitoring
* Government infrastructure/network security controls

The current cryptographic ledger provides **tamper evidence and integrity verification**, but should not by itself be considered a complete security or compliance system.

---

# 🤝 Contributing

Contributions are welcome.

```bash
# Fork the repository

# Create a feature branch
git checkout -b feature/new-feature

# Make your changes

# Commit
git commit -m "Add new feature"

# Push
git push origin feature/new-feature
```

Then open a Pull Request.

---

# 📄 License

This project is intended as a hackathon/educational implementation.

Add the project's final license here if the repository is released under a specific open-source license.

---

# 👨‍💻 Project

**AssetPulse**

Built as a modern digital infrastructure management platform focused on:

**Transparency • Accountability • Lifecycle Management • Security • Operational Intelligence**

<div align="center">

### 🏛️ AssetPulse

**Know your assets. Track their lifecycle. Verify every change.**

</div>
