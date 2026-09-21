# 🐾 PawPath — Dog Welfare Management Platform

> A collaborative platform connecting community members, veterinary hospitals, and adoption agencies to manage the full lifecycle of street dogs — from sighting to adoption.

---

## ✨ Features

- **Community Reporting** — Anyone can report a street dog with photos, videos, and location data.
- **Hospital Management** — Hospitals admit, treat, and discharge dogs with a complete medical timeline.
- **Shelter & Adoption** — Agencies manage shelter residents and process adoptions with private adopter records.
- **Role-Based Access Control (RBAC)** — Eight distinct roles with granular, server-enforced permissions.
- **Partner Directory** — Public-facing profiles for hospitals and adoption agencies, with editable descriptions, media galleries, and contact info.
- **Fullscreen Media Viewer** — Lightbox overlay for photos and videos with keyboard navigation, used across the platform.
- **Hover Image Carousel** — Dog cards cycle through photos on hover with crossfade transitions.
- **Hardened Security** — Email-verified registration, field-whitelisted Firestore rules, owner-scoped Storage rules, and all sensitive mutations routed through Cloud Functions.

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite 5, Vanilla CSS |
| **Backend** | Firebase Cloud Functions (v1), Firestore, Cloud Storage |
| **Auth** | Firebase Authentication (email/password) |
| **Typography** | DM Sans (UI), Fraunces (headings) via Google Fonts |
| **Hosting** | Local dev via Vite; ready for Firebase Hosting |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Authentication, Cloud Functions, and Cloud Storage enabled.

### Setup

```bash
# Clone the repository
git clone https://github.com/venkatasriramt-spec/dog-welfare-platform.git
cd dog-welfare-platform

# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..

# Deploy Firestore and Storage security rules
firebase deploy --only firestore:rules,storage

# Deploy Cloud Functions
firebase deploy --only functions

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root with your Firebase project config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 📁 Project Structure

```
├── src/
│   ├── App.jsx                  # Root component & page routing
│   ├── services.js              # Firebase SDK wrappers (auth, Firestore, Storage, Functions)
│   ├── constants.js             # Roles, statuses, breed options
│   ├── firebase.js              # Firebase initialisation
│   ├── contexts/
│   │   └── MediaViewerContext.jsx   # Global fullscreen media viewer
│   ├── layouts/
│   │   ├── PublicShell.jsx      # Public page wrapper (header + footer)
│   │   └── WorkspaceShell.jsx   # Authenticated workspace wrapper (sidebar + content)
│   ├── components/
│   │   ├── Header.jsx           # Public navigation bar
│   │   ├── DogRegistrationForm.jsx
│   │   ├── EditProfileForm.jsx
│   │   ├── HoverImageCarousel.jsx
│   │   ├── MedicalRecordForm.jsx
│   │   ├── StaffManager.jsx
│   │   ├── ParticleBackground.jsx
│   │   └── Confetti.jsx
│   └── pages/
│       ├── Home.jsx             # Public landing page
│       ├── About.jsx            # Mission statement
│       ├── Discover.jsx         # Dog directory (public + workspace)
│       ├── Partners.jsx         # Partner organisation directory
│       ├── OrgProfile.jsx       # Organisation profile view + editor
│       ├── DogProfile.jsx       # Dog record view + media gallery
│       ├── Report.jsx           # Community dog sighting report
│       ├── Login.jsx            # Sign-in / community registration
│       ├── ApplicationForm.jsx  # Partner application form
│       ├── Dashboard.jsx        # Role-based routing hub
│       ├── StaffDogs.jsx        # Staff workstation (patients / shelter dogs)
│       └── dashboards/
│           ├── PlatformAdminView.jsx
│           ├── HospitalDashboard.jsx
│           ├── AgencyDashboard.jsx
│           └── StaffDashboard.jsx
├── functions/
│   └── index.js                 # Cloud Functions (registerDog, updateDogRecord, transferDog, etc.)
├── .env                         # Environment variables (Firebase config)
├── firestore.rules              # Hardened Firestore security rules
├── storage.rules                # Owner-scoped Storage security rules
├── firebase.json                # Firebase project configuration
└── PROJECT_HISTORY.md           # Comprehensive system architecture & history
```

---

## 🔒 Security Model

- **No client-side Firestore writes for Dogs** — All dog mutations go through Cloud Functions.
- **Email verification required** — Account creation and applications require a verified email address.
- **Field-whitelisted updates** — Organisation profile edits are restricted to non-privileged fields only.
- **Owner-scoped Storage** — File uploads include `ownerId` metadata; delete/update is restricted to the uploader (or org admin for organisation media).
- **Role assignment is server-only** — Users cannot self-assign privileged roles from the client.
- **Registration rollback** — Failed registrations automatically clean up orphaned Auth accounts.

---

## 🧪 Test Data

| Document | Purpose |
|:---|:---|
| [`TEST_ACCOUNTS.md`](TEST_ACCOUNTS.md) | Credentials for all test accounts (platform admin, hospital staff, agency staff, community members) |
| [`TEST_DOGS.md`](TEST_DOGS.md) | Step-by-step test dog profiles covering the full lifecycle (report → treatment → transfer → shelter → adoption) |
| [`org_fake_data.md`](org_fake_data.md) | Synthetic organisation profiles (descriptions, hours, services) and AI image generation prompts |

> **Platform Admin:** `admin@pawpath.demo` / `pawpath`
> **All other accounts:** password `password123`

---

## 📄 License

This project was developed as a NoSQL database course project.
