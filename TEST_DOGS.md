# Test Dog Profiles

Use this data to populate the system and test the various role-based workflows.
To make testing easier and more realistic, these dogs flow through the different stages of the platform's lifecycle. A dog you report in Group A will be the same dog you treat in Group B, transfer in Group C, shelter in Group D, and adopt in Group E. Not all dogs go through every stage.

> **Note:** To verify Platform Admin statistics, log in as Platform Admin (`admin@pawpath.demo`) after completing all these steps to ensure all dogs and active organizations are correctly reflected in the global dashboard.

## Group A: The Street Dogs (Incoming Queue)
**Goal:** Test community reporting and Hospital Admin's 'Incoming Queue'.

### Apollo (Full Lifecycle)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Vikram Malhotra (`citycare.admin@pawpath.demo` - CityCare Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Apollo
  - Location: Marathahalli, Bangalore
  - Breed: Pomeranian
  - Gender: Male
  - Estimated Age: Puppy (6 months)
  - Description/Notes: Puppy found crying alone near the garbage dump.
  - Condition/Admission Notes: Weak and scared, possible minor injuries.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Apollo.jpg`

### Fiona (Full Lifecycle)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Kavita Reddy (`pawsclaws.admin@pawpath.demo` - Paws & Claws Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Fiona
  - Location: BTM Layout, Bangalore
  - Breed: Boxer
  - Gender: Female
  - Estimated Age: Adult (~2 years)
  - Description/Notes: Seen wandering around the layout for a few days.
  - Condition/Admission Notes: Skin infection visible, constantly scratching.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Fiona.jpg`

### Bella (Partial Lifecycle: Report -> Shelter)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Vikram Malhotra (`citycare.admin@pawpath.demo` - CityCare Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Bella
  - Location: Koramangala, Bangalore
  - Breed: Labrador Retriever
  - Gender: Female
  - Estimated Age: Adult (~3 years)
  - Description/Notes: Friendly but injured dog.
  - Condition/Admission Notes: Limping on the back left leg, needs checking.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Bella.jpg`

### Gatsby (Partial Lifecycle: Report -> Shelter)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Kavita Reddy (`pawsclaws.admin@pawpath.demo` - Paws & Claws Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Gatsby
  - Location: Indiranagar, Bangalore
  - Breed: Golden Retriever
  - Gender: Male
  - Estimated Age: Adult (~5 years)
  - Description/Notes: Struck by a vehicle, laying on the pavement.
  - Condition/Admission Notes: Hit by a two-wheeler, lying on the side of the road.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Gatsby.jpg`

### Charlie (Stuck in Treatment)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Vikram Malhotra (`citycare.admin@pawpath.demo` - CityCare Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Charlie
  - Location: Jayanagar, Bangalore
  - Breed: Boxer
  - Gender: Female
  - Estimated Age: Senior (8+ years)
  - Description/Notes: Needs urgent medical care.
  - Condition/Admission Notes: Weak and lethargic, refusing to eat.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Charlie.jpg`

### Hazel (Stuck in Treatment)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Dr. Kavita Reddy (`pawsclaws.admin@pawpath.demo` - Paws & Claws Admin) logs in -> 'Incoming Queue' -> clicks 'Admit to Hospital'.
* **Details:**
  - Dog Name: Hazel
  - Location: Electronic City, Bangalore
  - Breed: Indie
  - Gender: Female
  - Estimated Age: Adult (~3 years)
  - Description/Notes: Found tied to a fence.
  - Condition/Admission Notes: Collar on but no owner in sight for 2 days. Looks malnourished.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Hazel.jpg`

### Daisy (Ignored Report)
* **Scenario:** Community Report
* **Who uploads this:** Rahul Verma (`rahul.community@pawpath.demo` - Community Member)
* **Where to upload / perform:** Log in, click '+ Report a dog' from Discover
* **Action to Perform:** Verify that Daisy appears in the Incoming Queue for hospitals but is NOT admitted.
* **Details:**
  - Dog Name: Daisy
  - Location: Hebbal, Bangalore
  - Breed: Pug
  - Gender: Female
  - Estimated Age: Adult (~3 years)
  - Description/Notes: Lost pug wandering around.
  - Condition/Admission Notes: Seems healthy but lost.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Daisy.jpg`

---
## Group B: Active Patients (In Treatment)
**Goal:** Test direct admission by Hospital Admins and medical record updates by various Veterinarians.

> **Note:** Apollo, Fiona, Bella, Gatsby, Charlie, and Hazel from Group A are already in Treatment. The Veterinarian should update their medical records as per the steps below. The following dogs are *new walk-in* patients.

### Kiki (Direct Walk-in to Hospital)
* **Scenario:** Direct Admission & Treatment
* **Who uploads this:** Dr. Vikram Malhotra (`citycare.admin@pawpath.demo` - CityCare Admin)
* **Where to upload / perform:** Hospital Dashboard -> 'Incoming Queue' -> '+ Register Walk-in Patient'
* **Action to Perform:** Dr. Sarah Connor (`sarah.vet@citycare.demo` - Veterinarian) logs in -> 'Active Patients' -> Adds a Medical Record.
* **Details:**
  - Dog Name: Kiki
  - Location: Bellandur, Bangalore
  - Breed: Cocker Spaniel
  - Gender: Male
  - Estimated Age: Senior (8+ years)
  - Description/Notes: Brought in by a good samaritan.
  - Condition/Admission Notes: Parvovirus treatment in isolation ward.
  - Vaccinated: No
  - Neutered/Spayed: No
* **Image Name:** `Kiki.jpg`

### Rocky (Direct Walk-in to Hospital)
* **Scenario:** Direct Admission & Treatment
* **Who uploads this:** Dr. Kavita Reddy (`pawsclaws.admin@pawpath.demo` - Paws & Claws Admin)
* **Where to upload / perform:** Hospital Dashboard -> 'Incoming Queue' -> '+ Register Walk-in Patient'
* **Action to Perform:** Dr. Amit Verma (`amit.vet@pawsclaws.demo` - Veterinarian) logs in -> 'Active Patients' -> Adds a Medical Record.
* **Details:**
  - Dog Name: Rocky
  - Location: JP Nagar, Bangalore
  - Breed: Golden Retriever
  - Gender: Female
  - Estimated Age: Adult (~5 years)
  - Description/Notes: Elective surgery.
  - Condition/Admission Notes: Routine spay/neuter surgery recovery.
  - Vaccinated: Yes
  - Neutered/Spayed: Yes
* **Image Name:** `Rocky.jpg`

### Milo (Stuck in Direct Treatment)
* **Scenario:** Direct Admission & Treatment
* **Who uploads this:** Dr. Vikram Malhotra (`citycare.admin@pawpath.demo` - CityCare Admin)
* **Where to upload / perform:** Hospital Dashboard -> 'Incoming Queue' -> '+ Register Walk-in Patient'
* **Action to Perform:** Dr. Sarah Connor (`sarah.vet@citycare.demo` - Veterinarian) logs in -> 'Active Patients' -> Adds a Medical Record.
* **Details:**
  - Dog Name: Milo
  - Location: Hebbal, Bangalore
  - Breed: Dalmatian
  - Gender: Male
  - Estimated Age: Adult (~2 years)
  - Description/Notes: Injured in a fight.
  - Condition/Admission Notes: Wound management from dog bite.
  - Vaccinated: Yes
  - Neutered/Spayed: No
* **Image Name:** `Milo.jpg`

### Actions for Previously Admitted Dogs (From Group A)
* **Apollo**: Dr. Sarah Connor (`sarah.vet@citycare.demo`) -> Adds medical record: "Treated for minor scrapes and given fluids."
* **Fiona**: Dr. Amit Verma (`amit.vet@pawsclaws.demo`) -> Adds medical record: "Medicated bath and antibiotics for skin infection."
* **Bella**: Dr. Rajesh Sharma (`rajesh.vet@citycare.demo`) -> Adds medical record: "X-ray shows no fracture, given pain meds."
* **Gatsby**: Dr. Amit Verma (`amit.vet@pawsclaws.demo`) -> Adds medical record: "Stabilized, no internal bleeding."
* **Charlie**: Dr. Sarah Connor (`sarah.vet@citycare.demo`) -> Adds medical record: "On IV fluids, monitoring for kidney issues."
* **Hazel**: Dr. Amit Verma (`amit.vet@pawsclaws.demo`) -> Adds medical record: "Feeding slowly, running blood tests."

---
## Group C: Ready to Leave (Fit for Discharge)
**Goal:** Test multiple Veterinarians signing off on treatment and Hospital Admins processing transfers/discharges.

> **Note:** We will mark a subset of dogs as 'Fit for Discharge' and transfer them to agencies.

### Medical Clearance Actions
* **Who performs this:** The Veterinarian assigned to the dog.
* **Where to perform:** Staff Dashboard -> 'Active Patients' -> clicks 'Fit for Discharge'
  1. Dr. Sarah Connor clears **Apollo** (CityCare).
  2. Dr. Amit Verma clears **Fiona** (Paws & Claws).
  3. Dr. Rajesh Sharma clears **Bella** (CityCare).
  4. Dr. Amit Verma clears **Gatsby** (Paws & Claws).
  5. Dr. Sarah Connor clears **Kiki** (CityCare).
  6. Dr. Amit Verma clears **Rocky** (Paws & Claws).

### Transfer Actions
* **Who performs this:** The Hospital Admin.
* **Where to perform:** Hospital Dashboard -> 'Ready to Leave' -> clicks 'Transfer to Agency'
  1. Dr. Vikram Malhotra (CityCare) transfers **Apollo** to *Happy Tails Rescue*.
  2. Dr. Kavita Reddy (Paws & Claws) transfers **Fiona** to *Hope Street Sanctuary*.
  3. Dr. Vikram Malhotra (CityCare) transfers **Bella** to *Hope Street Sanctuary*.
  4. Dr. Kavita Reddy (Paws & Claws) transfers **Gatsby** to *Happy Tails Rescue*.
  5. Dr. Vikram Malhotra (CityCare) transfers **Kiki** to *Happy Tails Rescue*.
  6. Dr. Kavita Reddy (Paws & Claws) transfers **Rocky** to *Hope Street Sanctuary*.

---
## Group D: Shelter Residents (Available for Adoption)
**Goal:** Test shelter intake across both agencies and verify all Agency Employees can update records but NOT mark adoptions.

> **Note:** Apollo, Fiona, Bella, Gatsby, Kiki, and Rocky are now shelter residents. The Agency Employee should add an update note to their files. The following dogs are *new walk-in* intakes at the shelter.

### Zoe (Direct Shelter Intake)
* **Scenario:** Shelter Intake
* **Who uploads this:** Ananya Roy (`happytails.admin@pawpath.demo` - Happy Tails Admin)
* **Where to upload / perform:** Agency Dashboard -> 'Current Residents' -> '+ Register Walk-in Dog'
* **Action to Perform:** Priya Patel (`priya.staff@happytails.demo` - Employee) logs in -> 'Current Residents' -> Adds an update note. (Verify NO 'Mark Adopted' button).
* **Details:**
  - Dog Name: Zoe
  - Location: HSR Layout, Bangalore
  - Breed: Indie
  - Gender: Female
  - Estimated Age: Puppy (3 months)
  - Description/Notes: High energy, playful.
  - Condition/Admission Notes: Surrendered by previous owner. Healthy.
  - Vaccinated: Yes
  - Neutered/Spayed: No
* **Image Name:** `Zoe.jpg`

### Frankie (Direct Shelter Intake)
* **Scenario:** Shelter Intake
* **Who uploads this:** Marcus Chen (`hopestreet.admin@pawpath.demo` - Hope Street Admin)
* **Where to upload / perform:** Agency Dashboard -> 'Current Residents' -> '+ Register Walk-in Dog'
* **Action to Perform:** Maya Sen (`maya.staff@hopestreet.demo` - Employee) logs in -> 'Current Residents' -> Adds an update note. (Verify NO 'Mark Adopted' button).
* **Details:**
  - Dog Name: Frankie
  - Location: JP Nagar, Bangalore
  - Breed: Labrador Retriever
  - Gender: Female
  - Estimated Age: Senior (10+ years)
  - Description/Notes: Calm and well-behaved.
  - Condition/Admission Notes: Healthy, recently groomed, very playful.
  - Vaccinated: Yes
  - Neutered/Spayed: Yes
* **Image Name:** `Frankie.jpg`

### Actions for Previously Transferred Dogs
* **Apollo** (Happy Tails): Priya Patel (`priya.staff@happytails.demo`) adds a note: "Settling in well, playful with other dogs."
* **Fiona** (Hope Street): Maya Sen (`maya.staff@hopestreet.demo`) adds a note: "Skin is healing beautifully, fur growing back."
* **Bella** (Hope Street): Maya Sen adds a note: "Limp is gone, loves going for walks."
* **Gatsby** (Happy Tails): Alex Miller (`alex.staff@happytails.demo`) adds a note: "Fully recovered from the accident, very gentle."
* **Kiki** (Happy Tails): Alex Miller adds a note: "Parvo survivor, now eating like a champ."
* **Rocky** (Hope Street): Maya Sen adds a note: "Spay recovery complete, ready for a home."

---
## Group E: Adopted Dogs (Adoption History)
**Goal:** Test multiple Agency Admins processing adoptions.

### Actions to Perform
* **Who performs this:** The Agency Admin.
* **Where to perform:** Agency Dashboard -> 'Current Residents' -> Fills out adopter details -> Verify dog moves to 'Adoption History' tab.
  
1. **Apollo**: Ananya Roy (`happytails.admin@pawpath.demo`) processes adoption. 
2. **Fiona**: Marcus Chen (`hopestreet.admin@pawpath.demo`) processes adoption.
3. **Kiki**: Ananya Roy (`happytails.admin@pawpath.demo`) processes adoption.
4. **Zoe**: Ananya Roy (`happytails.admin@pawpath.demo`) processes adoption.

> **Bella**, **Gatsby**, **Rocky**, and **Frankie** remain in the shelter as 'Current Residents' awaiting adoption.
