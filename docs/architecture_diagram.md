# Project Architecture

Here is the high-level architecture diagram for the AssetPulse (Government Asset Management) application, outlining the main components and how they interact.

```mermaid
graph TD
    subgraph Client ["Client (Frontend)"]
        direction TB
        UI["React UI (Pages & Components)<br/><i>Tailwind CSS, Lucide Icons</i>"]
        State["State Management<br/><i>Zustand</i>"]
        Router["Routing<br/><i>React Router</i>"]
        APIClient["HTTP Client<br/><i>Axios</i>"]
        PWA["Offline Storage<br/><i>IndexedDB / idb-keyval</i>"]
        
        UI <--> State
        UI --> Router
        State <--> APIClient
        APIClient -.-> PWA
        UI -.-> PWA
    end

    subgraph Server ["Server (Backend)"]
        direction TB
        ExpressApp["Express App<br/><i>Node.js, Express, Zod</i>"]
        
        subgraph Routes ["API Routes"]
            AuthRoute["/api/auth"]
            AssetRoute["/api/assets<br/>/api/portfolio"]
            LedgerRoute["/api/ledger<br/>/api/events"]
            UserRoute["/api/users<br/>/api/activity"]
            NotifRoute["/api/notifications<br/>/api/maintenance"]
        end
        
        Mongoose["Mongoose ODM"]

        ExpressApp --> AuthRoute
        ExpressApp --> AssetRoute
        ExpressApp --> LedgerRoute
        ExpressApp --> UserRoute
        ExpressApp --> NotifRoute
        
        AuthRoute --> Mongoose
        AssetRoute --> Mongoose
        LedgerRoute --> Mongoose
        UserRoute --> Mongoose
        NotifRoute --> Mongoose
    end

    subgraph Database ["Database"]
        MongoDB[("MongoDB<br/><i>assetpulse_gov</i>")]
    end

    %% External Connections
    APIClient -- "REST API (JSON over HTTP/S)" --> ExpressApp
    Mongoose -- "TCP/IP" --> MongoDB
    
    %% Styling
    classDef clientLayer fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b
    classDef serverLayer fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#14532d
    classDef dbLayer fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f
    
    class Client,UI,State,Router,APIClient,PWA clientLayer
    class Server,ExpressApp,Routes,AuthRoute,AssetRoute,LedgerRoute,UserRoute,NotifRoute,Mongoose serverLayer
    class Database,MongoDB dbLayer
```

### Technology Stack Details

#### 1. Frontend (Client)
- **Framework**: React with Vite for fast building and HMR.
- **Styling**: Tailwind CSS for utility-first styling.
- **State Management**: Zustand for lightweight global state.
- **Routing**: React Router DOM.
- **PWA & Offline**: Uses `vite-plugin-pwa` and `idb-keyval` (IndexedDB) for offline capabilities.
- **Other utilities**: `axios` for network requests, `html5-qrcode` / `qrcode.react` for QR code functionality, `recharts` for data visualization.

#### 2. Backend (Server)
- **Environment**: Node.js
- **Framework**: Express.js
- **Validation**: Zod for schema validation.
- **Authentication**: JWT (`jsonwebtoken`) and `bcryptjs` for secure password hashing.
- **Middleware**: `morgan` for logging, `cors` for Cross-Origin Resource Sharing.

#### 3. Database
- **Database**: MongoDB (accessed via the Mongoose Object Data Modeling library).
- **Primary Domain**: Asset management (`assetpulse_gov`), covering assets, portfolios, ledger (transactions/transfers), events, users, maintenance logs, and notifications.
