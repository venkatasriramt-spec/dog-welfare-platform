# PawPath: Dog Welfare Management System
**Project History & System Architecture**

This document serves as a comprehensive history and specification of the features, architecture, and workflows implemented in the PawPath project to date.

---

## 1. System Overview
PawPath is a decentralized dog welfare platform designed to connect community members, veterinary hospitals, and adoption agencies. It facilitates the end-to-end lifecycle of street dogs—from initial sighting and reporting, through medical treatment, to eventual adoption or community release.

**Tech Stack:**
* **Frontend:** React, Vite, Vanilla CSS
* **Backend:** Firebase (Authentication, Firestore, Cloud Functions, Cloud Storage)
* **Hosting:** Local development (ready for Firebase Hosting)

---

## 2. Authentication & Role-Based Access Control (RBAC)
The system uses Firebase Authentication combined with a `Users` collection in Firestore to manage profiles and roles. 

### Supported Roles:
1. **Platform Admin (`platform_admin`)**: Oversees the entire system, approves/rejects new organization applications, and has global read/write access.
2. **Hospital Admin (`hospital_admin`)**: Manages a specific veterinary hospital, adds veterinarians, and oversees admitted dogs.
3. **Veterinarian (`veterinarian`)**: Admits dogs from the street, adds medical records, and transfers dogs to agencies.
4. **Agency Admin (`agency_admin`)**: Manages a specific adoption agency, adds employees, and oversees shelter dogs.
5. **Agency Employee (`agency_employee`)**: Updates shelter dog records and processes adoptions.
6. **Community Member (`community_member`)**: Explores the network and reports new street dogs (with photos and location data).

---

## 3. Organization Management
A secure onboarding flow exists for new partner organizations (Hospitals and Agencies).

* **Application Flow:** Organizations apply via the frontend. The application is stored in the `OrganizationApplications` collection.
* **Approval Process:** The Platform Admin reviews applications. Approving an application (via the `approveOrganizationApplication` Cloud Function) automatically creates the organization in the `Organizations` collection and provisions an Admin account for the applicant.
* **Staff Management:** Org Admins can add staff members to their organization (via the `addOrgStaff` Cloud Function).

---

## 4. The Dog Lifecycle & Data Model
The core of the application revolves around the `Dogs` collection. Every dog is assigned a unique, auto-incrementing tag (e.g., `PAW-1042`).

### Lifecycle Statuses:
1. **`street`**: The dog has been reported by a community member but not yet rescued.
2. **`in_treatment`**: A hospital has admitted the dog for medical care.
3. **`adoptable`**: The dog has been transferred to an adoption agency and is looking for a home.
4. **`adopted`**: The dog has successfully found a forever home.
5. **`community_dog`**: The dog was treated and released back into the community (e.g., under ABC/ARV protocols).

### Medical & Provenance Tracking:
* **Identity:** Breed, estimated age, gender, location found, and photos.
* **Medical Status:** Real-time tracking of Vaccination and Neutered/Spayed status.
* **Treatment Timeline:** An immutable array (`treatment_timeline`) tracking every major event (Admission, Treatment, Transfer, Discharge, Adoption) with timestamps, notes, and the staff member responsible.
* **Provenance:** Tracks the original reporter, current managing organization, and full hospital history.

---

## 5. Key Cloud Functions (Backend Logic)
To ensure data integrity and bypass client-side manipulation, sensitive operations are handled via Firebase Cloud Functions:

* `registerDog`: Generates a secure `PAW-XXXX` tag and initializes the dog's record and status based on the user's role.
* `updateDogRecord`: Appends medical timeline entries and updates core statuses securely.
* `transferDog`: Safely transfers a dog from a hospital's custody to an agency's custody.
* `createPartnerApplication` / `approveOrganizationApplication` / `declineOrganizationApplication`: Manages the organization lifecycle.
* `addOrgStaff` / `createCommunityProfile`: Securely provisions Firebase Auth users and sets up their Firestore profiles.

---

## 6. Frontend Features & UI
The frontend features a clean, modern, and responsive design with distinct workspaces:

* **Discover & Report:** A public-facing (for signed-in community users) directory of dogs with advanced filtering, and a comprehensive reporting form that supports image uploads directly to Firebase Storage.
* **Hospital Dashboard:** Allows hospital staff to view total metrics, admit street dogs from the network, manage their specific patients, and update medical records.
* **Agency Dashboard:** Allows agency staff to manage shelter inventory, receive hospital transfers, and process adoptions.
* **Platform Admin Dashboard:** A global view for managing pending organization applications and system-wide metrics.
* **Rich Dog Profiles:** A dedicated view for each dog displaying their identity, photo (fetched from Firebase Storage), current status, provenance, and a full chronological medical timeline.

---

## 7. Security (Firestore & Storage Rules)
* **Firestore Rules:** Enforces strict read/write access. Users can only edit their own profiles. Only authorized roles (Admins, Vets, Employees) can modify dog records, while maintaining public read access for the community.
* **Storage Rules:** Allows public read access to dog photos (`dog_photos/`), but restricts uploads (up to 5MB, image types only) to authenticated users.

---

## 8. Test Data
A complete set of test accounts representing every role in the system was created and documented in `TEST_ACCOUNTS.md`. These accounts use Gmail aliasing (e.g., `venkatasriramt+xyz@gmail.com`) for easy local testing.
