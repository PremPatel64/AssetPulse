# Advanced System Architecture: AssetPulse (Gov)

This document provides a deep-dive technical architecture analysis of the AssetPulse system. It covers the system topology, the event-sourced verifiable ledger, the Entity Relationship Diagram (ERD), and complex workflow sequence diagrams.

---

## 1. Top-Level System Topology

The system adopts a modern 3-Tier architecture enhanced with Offline-First Progressive Web App (PWA) capabilities and an Event-Sourcing pattern for its core data integrity.

```mermaid
C4Context
    title System Context - AssetPulse (Government Asset Management)

    Person(admin, "Admin / Manager", "Oversees portfolios, runs ledger audits.")
    Person(tech, "Field Technician", "Inspects and transfers assets. Uses PWA offline.")

    System_Boundary(c1, "AssetPulse Platform") {
        Container(pwa, "Frontend PWA", "React, Vite, Zustand", "Provides offline-capable UI via Service Workers & IndexedDB.")
        Container(api, "Backend API", "Node.js, Express", "Handles business logic, RBAC, and ledger cryptography.")
        ContainerDb(db, "Operational DB", "MongoDB / Mongoose", "Stores Assets, Users, and the immutable Event Ledger.")
    }

    Rel(admin, pwa, "Views dashboards, verifies ledger", "HTTPS")
    Rel(tech, pwa, "Scans QR codes, logs maintenance", "HTTPS / Offline")
    Rel(pwa, api, "REST API Calls (JSON/JWT)", "Axios")
    Rel(api, db, "Mongoose Queries & Transactions", "Mongoose/TCP")
```

---

## 2. Event-Sourced Verifiable Ledger Architecture

Unlike a traditional CRUD application, AssetPulse utilizes an **Event-Sourced Cryptographic Ledger** for its assets. Every state change (transfer, maintenance, inspection) is appended as an immutable event linked by cryptographic hashes.

```mermaid
graph LR
    subgraph AssetAggregateRoot ["Asset Aggregate Root"]
        Asset["Asset Document (Current State Snapshot)"]
        CurrentValues["status, location, condition, etc."]
        LastEventHash["lastEventHash: e4f5a2..."]
        
        Asset -->|"Contains"| CurrentValues
        Asset -->|"Pointer"| LastEventHash
    end

    subgraph ImmutableEventChain ["Immutable Event Chain (Ledger)"]
        direction LR
        Event0["AssetEvent 0: CREATED"]
        Event1["AssetEvent 1: COMMISSIONED"]
        Event2["AssetEvent 2: TRANSFERRED"]
        Event3["AssetEvent 3: INSPECTED"]
        
        Event1 -->|"prevHash"| Event0
        Event2 -->|"prevHash"| Event1
        Event3 -->|"prevHash"| Event2
    end

    LastEventHash -.->|"Points to"| Event3
    
    %% Styling
    classDef snap fill:#eef2ff,stroke:#6366f1,stroke-width:2px
    classDef event fill:#f0fdf4,stroke:#22c55e,stroke-width:2px
    class Asset snap
    class Event0,Event1,Event2,Event3 event
```

### Key Principles of the Ledger:
1. **Immutability**: `AssetEvent` documents are never updated or deleted.
2. **Cryptographic Chaining**: Each event calculates its `hash` based on the payload and the `prevHash` of the previous event in the sequence.
3. **Auditability**: The `/api/ledger/verify` endpoint dynamically traverses the chain to detect tampering or broken links.

---

## 3. Entity Relationship Diagram (ERD)

This ERD highlights the core database schema mapped through Mongoose models.

```mermaid
erDiagram
    ASSET ||--o{ ASSET_EVENT : "has history (1:N)"
    USER ||--o{ ASSET_EVENT : "performs (1:N)"
    
    ASSET {
        ObjectId _id PK
        String tag "UK (e.g., GOV-VEH-0001)"
        String name
        String category "Enum (VEHICLE, IT_EQUIPMENT...)"
        String status "Enum (IN_SERVICE, DISPOSED...)"
        String condition "Enum"
        Number currentValue
        ObjectId lastEventHash
        Number eventCount
        JSON geoCoords
        JSON compliance
    }

    USER {
        ObjectId _id PK
        String name
        String email "UK"
        String passwordHash
        String role "Enum (ADMIN, TECHNICIAN...)"
        String site
    }

    ASSET_EVENT {
        ObjectId _id PK
        ObjectId assetId FK
        Number seq "Sequence number (Unique with assetId)"
        String type "Enum (TRANSFERRED, INSPECTED...)"
        JSON payload "Mixed Event Data"
        ObjectId actorId FK "User who initiated"
        Date occurredAt
        String prevHash "Cryptographic link"
        String hash "Cryptographic signature"
    }
```

---

## 4. Sequence Diagram: Asset Transfer & Ledger Appending

This sequence shows the complex interaction when a user initiates a state-changing action (like transferring an asset), detailing how the client, API, and event ledger interact to ensure atomicity.

```mermaid
sequenceDiagram
    autonumber
    actor Tech as Technician
    participant PWA as Client (React/Zustand)
    participant API as Backend (Express)
    participant Service as Ledger Service
    participant DB as MongoDB

    Tech->>PWA: Submits Asset Transfer Form
    PWA->>API: POST /api/events (type: TRANSFERRED)
    
    activate API
    API->>API: JWT Auth & RBAC Check
    
    API->>Service: handleAssetEvent(payload, user)
    activate Service
    
    Service->>DB: Fetch Asset & Last Event
    DB-->>Service: Asset (eventCount: N, lastHash: H1)
    
    Service->>Service: Generate Hash (H1 + Payload + Timestamp)
    
    Service->>DB: Transaction Start
    Service->>DB: Insert AssetEvent (seq: N+1, prevHash: H1, hash: H2)
    Service->>DB: Update Asset (status/location, eventCount: N+1, lastHash: H2)
    Service->>DB: Transaction Commit
    
    Service-->>API: Success (Event ID)
    deactivate Service
    
    API-->>PWA: 201 Created
    deactivate API
    
    PWA->>PWA: Zustand Store Update
    PWA-->>Tech: Success Notification
```

---

## 5. Client State Management Architecture

The frontend leverages a distributed state pattern using Zustand, separating UI concerns from API caching and domain logic.

```mermaid
graph TD
    subgraph UILayer ["React Component Tree"]
        Pages["Pages (TransferAsset, AssetList, ActivityTimeline)"]
        Components["UI Components (OutboxBadge, Modals, Forms)"]
        Pages --> Components
    end

    subgraph StateLayer ["Zustand Stores"]
        AuthStore["useAuth Store (JWT, User Profile)"]
        AssetStore["useAsset Store (Asset Cache, Queries)"]
        SyncStore["useSync Store (Offline Queue Management)"]
    end

    subgraph StorageLayer ["Local & Remote"]
        Axios["Axios Interceptors (Auth Header Injection)"]
        IDB[("IndexedDB (idb-keyval)")]
    end

    Pages --> AuthStore
    Pages --> AssetStore
    Components --> SyncStore
    
    AssetStore --> Axios
    SyncStore --> IDB
    SyncStore -.->|"Background Sync"| Axios
```
