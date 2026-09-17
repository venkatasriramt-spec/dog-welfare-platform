const functions = require("firebase-functions/v1");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {FieldValue, getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");

initializeApp();
const db = getFirestore();

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new functions.https.HttpsError("invalid-argument", `${fieldName} is required.`);
  }
  return value.trim();
}

/**
 * Approves a pending Hospital or Adoption Agency application.
 */
exports.approveOrganizationApplication = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerRef = db.collection("Users").doc(context.auth.uid);
  const caller = await callerRef.get();
  if (!caller.exists || caller.data().role !== "platform_admin") {
    throw new functions.https.HttpsError("permission-denied", "Only the platform administrator can approve applications.");
  }

  const applicationId = requireNonEmptyString(data.applicationId, "applicationId");
  const applicationRef = db.collection("OrganizationApplications").doc(applicationId);
  const application = await applicationRef.get();
  if (!application.exists) {
    throw new functions.https.HttpsError("not-found", "Organisation application not found.");
  }

  const applicationData = application.data();
  if (applicationData.status !== "pending") {
    throw new functions.https.HttpsError("failed-precondition", "Only pending applications can be approved.");
  }

  const type = applicationData.type;
  if (type !== "hospital" && type !== "agency") {
    throw new functions.https.HttpsError("failed-precondition", "Application has an invalid organisation type.");
  }

  const organizationName = requireNonEmptyString(applicationData.organization_name, "organization_name");
  const adminName = requireNonEmptyString(applicationData.contact_name, "contact_name");
  const adminEmail = requireNonEmptyString(applicationData.contact_email, "contact_email").toLowerCase();

  const creatorUid = applicationData.creator_uid;
  if (!creatorUid) {
    throw new functions.https.HttpsError("failed-precondition", "Application is missing a creator UID.");
  }

  try {
    const organizationRef = db.collection("Organizations").doc();
    const role = type === "hospital" ? "hospital_admin" : "agency_admin";
    const batch = db.batch();

    batch.set(organizationRef, {
      name: organizationName,
      type,
      status: "active",
      email: adminEmail,
      phone: applicationData.phone || "",
      address: applicationData.address || "",
      admin_uid: creatorUid,
      created_at: FieldValue.serverTimestamp(),
      created_by: context.auth.uid,
    });

    batch.set(db.collection("Users").doc(creatorUid), {
      full_name: adminName,
      email: adminEmail,
      role,
      works_at: organizationRef.id,
      is_active: true,
      created_at: FieldValue.serverTimestamp(),
    }, {merge: true});

    batch.update(applicationRef, {
      status: "approved",
      organization_id: organizationRef.id,
      approved_by: context.auth.uid,
      approved_at: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    functions.logger.info("Organisation application approved", {applicationId, organizationId: organizationRef.id});
    return {organizationId: organizationRef.id, adminUid: creatorUid};
  } catch (error) {
    functions.logger.error("Organisation approval failed", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not approve the organisation. Please try again.");
  }
});

exports.declineOrganizationApplication = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");

  const callerRef = db.collection("Users").doc(context.auth.uid);
  const caller = await callerRef.get();
  if (!caller.exists || caller.data().role !== "platform_admin") {
    throw new functions.https.HttpsError("permission-denied", "Only the platform administrator can decline applications.");
  }

  const applicationId = requireNonEmptyString(data.applicationId, "applicationId");
  const reason = (data.reason || "").trim();

  const applicationRef = db.collection("OrganizationApplications").doc(applicationId);
  const application = await applicationRef.get();

  if (!application.exists) throw new functions.https.HttpsError("not-found", "Organisation application not found.");
  if (application.data().status !== "pending") throw new functions.https.HttpsError("failed-precondition", "Only pending applications can be declined.");

  try {
    const batch = db.batch();

    batch.update(applicationRef, {
      status: "declined",
      declined_by: context.auth.uid,
      declined_at: FieldValue.serverTimestamp(),
      decline_reason: reason,
    });

    const creatorUid = application.data().creator_uid;
    if (creatorUid) {
      batch.update(db.collection("Users").doc(creatorUid), {
        role: "rejected_partner",
        reject_reason: reason,
      });
    }

    await batch.commit();

    functions.logger.info("Organisation application declined", {applicationId});
    return {success: true};
  } catch (error) {
    functions.logger.error("Organisation decline failed", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not decline the organisation.");
  }
});

exports.createPartnerApplication = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email;
  if (!email) {
    throw new functions.https.HttpsError("failed-precondition", "Your account does not have an email address.");
  }

  const organizationName = requireNonEmptyString(data.organization_name, "organization_name");
  const type = data.type;
  if (type !== "hospital" && type !== "agency") {
    throw new functions.https.HttpsError("invalid-argument", "Organisation type must be 'hospital' or 'agency'.");
  }
  const contactName = requireNonEmptyString(data.contact_name, "contact_name");
  const phone = (data.phone || "").trim();
  const address = (data.address || "").trim();

  // Prevent duplicate: check if user already has a profile
  const existingProfile = await db.collection("Users").doc(uid).get();
  if (existingProfile.exists) {
    const role = existingProfile.data().role;
    if (role !== "pending_partner" && role !== "community_member") {
      throw new functions.https.HttpsError("already-exists", "You already have an active role in the system.");
    }
  }

  try {
    const batch = db.batch();

    // Create or update the user's profile
    batch.set(db.collection("Users").doc(uid), {
      full_name: contactName,
      email: email.toLowerCase(),
      role: "pending_partner",
      is_active: true,
      created_at: FieldValue.serverTimestamp(),
    }, {merge: true});

    // Create the application document
    const applicationRef = db.collection("OrganizationApplications").doc();
    batch.set(applicationRef, {
      organization_name: organizationName,
      type,
      contact_name: contactName,
      contact_email: email.toLowerCase(),
      phone,
      address,
      creator_uid: uid,
      status: "pending",
      created_at: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    functions.logger.info("Partner application created", {uid, applicationId: applicationRef.id});
    return {success: true, applicationId: applicationRef.id};
  } catch (error) {
    functions.logger.error("Partner application creation failed", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not submit the application.");
  }
});

exports.addOrgStaff = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection("Users").doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerData = callerSnap.data();
  const callerRole = callerData.role;
  const callerOrgId = callerData.works_at;

  if (callerRole !== "hospital_admin" && callerRole !== "agency_admin") {
    throw new functions.https.HttpsError("permission-denied", "Only hospital or agency administrators can add staff members.");
  }

  if (!callerOrgId) {
    throw new functions.https.HttpsError("failed-precondition", "Administrator is not assigned to an organisation.");
  }

  const name = requireNonEmptyString(data.name, "name");
  const email = requireNonEmptyString(data.email, "email").toLowerCase();
  const password = requireNonEmptyString(data.password, "password");
  const title = (data.title || "").trim();

  if (password.length < 6) {
    throw new functions.https.HttpsError("invalid-argument", "Password must be at least 6 characters.");
  }

  const targetRole = callerRole === "hospital_admin" ? "veterinarian" : "agency_employee";

  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("Users").doc(userRecord.uid).set({
      full_name: name,
      email,
      role: targetRole,
      works_at: callerOrgId,
      title: title || (targetRole === "veterinarian" ? "General Veterinarian" : "Staff Member"),
      is_active: true,
      created_at: FieldValue.serverTimestamp(),
      created_by: callerUid,
    });

    functions.logger.info("Org staff member added successfully", {
      uid: userRecord.uid,
      email,
      role: targetRole,
      organizationId: callerOrgId,
    });

    return {success: true, uid: userRecord.uid};
  } catch (error) {
    functions.logger.error("Failed to add staff member", error);
    if (error.code === "auth/email-already-exists") {
      throw new functions.https.HttpsError("already-exists", "An account with this email address already exists.");
    }
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not add staff member.");
  }
});

exports.createCommunityProfile = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }
  const uid = context.auth.uid;
  const email = context.auth.token.email || "";
  const name = requireNonEmptyString(data.name, "name");

  try {
    await db.collection("Users").doc(uid).set({
      full_name: name,
      email: email.toLowerCase(),
      role: "community_member",
      is_active: true,
      created_at: FieldValue.serverTimestamp(),
    }, {merge: true});

    functions.logger.info("Community profile created", {uid, email});
    return {success: true};
  } catch (error) {
    functions.logger.error("Failed to create community profile", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not create profile.");
  }
});

/**
 * Generates a unique dog tag ID like PAW-1042.
 */
async function generateDogTag() {
  const counterRef = db.collection("Counters").doc("dogs");
  const counterSnap = await counterRef.get();
  let nextNum = 1001;
  if (counterSnap.exists) {
    nextNum = (counterSnap.data().last_number || 1000) + 1;
  }
  await counterRef.set({last_number: nextNum}, {merge: true});
  return `PAW-${nextNum}`;
}

/**
 * Registers a new dog into the system.
 * Can be called by: hospital_admin, veterinarian, agency_admin, agency_employee, community_member
 */
exports.registerDog = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection("Users").doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerData = callerSnap.data();
  const callerRole = callerData.role;
  const callerOrgId = callerData.works_at || null;

  const allowedRoles = [
    "platform_admin", "hospital_admin",
    "agency_admin", "community_member",
  ];
  if (!allowedRoles.includes(callerRole)) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to register dogs.");
  }

  const name = requireNonEmptyString(data.name, "name");
  const breed = (data.breed || "Unknown / Unidentified").trim();
  const estimatedAge = (data.estimated_age || "Unknown").trim();
  const gender = (data.gender || "Unknown").trim();
  const locationFound = (data.location_found || "").trim();
  const description = (data.description || "").trim();
  const conditionNotes = (data.condition_notes || "").trim();
  const imageUrl = (data.image_url || "").trim();
  const socialPhotos = Array.isArray(data.social_photos) ? data.social_photos : (imageUrl ? [imageUrl] : []);
  const videos = Array.isArray(data.videos) ? data.videos : [];
  const isVaccinated = data.is_vaccinated === true;
  const isNeutered = data.is_neutered === true;

  // Determine initial status and org assignment based on caller role
  let status = "street";
  let hospitalId = null;
  let agencyId = null;

  if (callerRole === "hospital_admin") {
    status = "in_treatment";
    hospitalId = callerOrgId;
  } else if (callerRole === "agency_admin") {
    status = "adoptable";
    agencyId = callerOrgId;
  }

  try {
    const tag = await generateDogTag();

    const dogDoc = {
      tag,
      name,
      breed,
      estimated_age: estimatedAge,
      gender,
      location_found: locationFound,
      location: locationFound,
      description,
      status,
      registered_by: callerUid,
      registered_by_name: callerData.full_name || "Unknown",
      registered_by_role: callerRole,
      hospital_id: hospitalId,
      agency_id: agencyId,
      medical_status: {
        is_vaccinated: isVaccinated,
        is_neutered: isNeutered,
      },
      treatment_timeline: conditionNotes ? [{
        date: new Date().toISOString(),
        type: "admission",
        notes: conditionNotes,
        recorded_by: callerUid,
        recorded_by_name: callerData.full_name || "Unknown",
        hospital_id: hospitalId,
      }] : [],
      hospital_history: hospitalId ? [hospitalId] : [],
      social_photos: socialPhotos,
      videos: videos,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };

    const dogRef = await db.collection("Dogs").add(dogDoc);

    functions.logger.info("Dog registered", {dogId: dogRef.id, tag, name, status});
    return {success: true, dogId: dogRef.id, tag};
  } catch (error) {
    functions.logger.error("Failed to register dog", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not register dog.");
  }
});

/**
 * Updates a dog's medical record (treatment timeline, vaccination, neuter, status, breed).
 * Can be called by: hospital_admin, veterinarian, agency_admin, agency_employee, platform_admin
 */
exports.updateDogRecord = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection("Users").doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerData = callerSnap.data();
  const callerRole = callerData.role;
  const callerOrgId = callerData.works_at || null;

  const allowedRoles = [
    "platform_admin", "hospital_admin", "veterinarian",
    "agency_admin", "agency_employee",
  ];
  if (!allowedRoles.includes(callerRole)) {
    throw new functions.https.HttpsError("permission-denied", "You do not have permission to update dog records.");
  }

  const dogId = requireNonEmptyString(data.dogId, "dogId");
  const dogRef = db.collection("Dogs").doc(dogId);
  const dogSnap = await dogRef.get();

  if (!dogSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Dog record not found.");
  }

  const dogData = dogSnap.data();
  const isAdmitting = data.status === "in_treatment" && callerRole === "hospital_admin" && dogData.status === "street";

  if (callerRole !== "platform_admin" && !isAdmitting) {
    if (callerRole === "hospital_admin" || callerRole === "veterinarian") {
      if (dogData.hospital_id !== callerOrgId || !["in_treatment", "fit_for_discharge"].includes(dogData.status)) {
        throw new functions.https.HttpsError("permission-denied", "You can only edit records for dogs actively admitted to your hospital.");
      }
    } else if (callerRole === "agency_admin" || callerRole === "agency_employee") {
      if (dogData.agency_id !== callerOrgId || dogData.status !== "adoptable") {
        throw new functions.https.HttpsError("permission-denied", "You can only edit records for dogs currently in your agency's care.");
      }
    }
  }

  try {
    const updates = {
      updated_at: FieldValue.serverTimestamp(),
    };

    // Update medical status
    if (data.is_vaccinated !== undefined) {
      updates["medical_status.is_vaccinated"] = data.is_vaccinated === true;
    }
    if (data.is_neutered !== undefined) {
      updates["medical_status.is_neutered"] = data.is_neutered === true;
    }

    // Update metadata
    if (data.name) {
      updates.name = data.name.trim();
    }
    if (data.estimated_age !== undefined) {
      updates.estimated_age = (data.estimated_age || "").trim();
    }
    if (data.gender) {
      updates.gender = data.gender.trim();
    }

    // Update social photos and videos (replaces entirely to allow adding/deleting)
    // We collect the removed URLs to delete them from Storage *after* Firestore updates successfully.
    let newPhotos = dogData.social_photos || [];
    let newVideos = dogData.videos || [];
    const oldMedia = [];

    if (Array.isArray(data.social_photos)) {
      newPhotos = data.social_photos.filter((p) => typeof p === "string" && p.trim().length > 0);
      updates.social_photos = newPhotos;
      oldMedia.push(...(dogData.social_photos || []));
    }

    if (Array.isArray(data.videos)) {
      newVideos = data.videos.filter((v) => typeof v === "string" && v.trim().length > 0);
      updates.videos = newVideos;
      oldMedia.push(...(dogData.videos || []));
    }

    const finalMedia = [...newPhotos, ...newVideos];
    const filesToDelete = oldMedia.filter((url) => !finalMedia.includes(url));

    // Update breed
    if (data.breed) {
      updates.breed = data.breed.trim();
    }

    // Update status if provided
    const validStatuses = ["street", "in_treatment", "adoptable", "community_dog", "adopted", "fit_for_discharge"];
    if (data.status && validStatuses.includes(data.status)) {
      if (callerRole === "veterinarian" && data.status !== "fit_for_discharge") {
        throw new functions.https.HttpsError("permission-denied", "Veterinarians can only change status to 'fit_for_discharge'.");
      }
      if (callerRole === "agency_employee") {
        throw new functions.https.HttpsError("permission-denied", "Agency employees cannot change a dog's status.");
      }

      updates.status = data.status;

      // If admitting to hospital, set hospital_id
      if (data.status === "in_treatment" && callerRole === "hospital_admin") {
        updates.hospital_id = callerOrgId;
        // Add to hospital history if not already there
        const currentHistory = dogSnap.data().hospital_history || [];
        if (callerOrgId && !currentHistory.includes(callerOrgId)) {
          updates.hospital_history = FieldValue.arrayUnion(callerOrgId);
        }
      }
    }

    // Add treatment timeline entry
    if (data.timeline_entry) {
      const entry = {
        date: new Date().toISOString(),
        type: data.timeline_entry.type || "update",
        notes: (data.timeline_entry.notes || "").trim(),
        diagnosis: (data.timeline_entry.diagnosis || "").trim(),
        prescription: (data.timeline_entry.prescription || "").trim(),
        recorded_by: callerUid,
        recorded_by_name: callerData.full_name || "Unknown",
        hospital_id: callerOrgId,
      };
      updates.treatment_timeline = FieldValue.arrayUnion(entry);
    }

    // Wait for the record update to complete before modifying Storage
    await dogRef.update(updates);

    // Clean up removed files from Storage
    if (filesToDelete.length > 0) {
      const storageBucket = getStorage().bucket();
      await Promise.allSettled(filesToDelete.map(async (url) => {
        try {
          const match = url.match(/\/o\/(.+?)\?/);
          if (match && match[1]) {
            const filePath = decodeURIComponent(match[1]);
            // Validate that the decoded object path is in our expected directories
            if (filePath.startsWith("dog_media/")) {
              await storageBucket.file(filePath).delete();
            } else {
              functions.logger.warn("Skipping deletion of invalid storage path", {filePath});
            }
          }
        } catch (e) {
          functions.logger.error("Failed to delete from storage", url, e);
        }
      }));
    }

    functions.logger.info("Dog record updated", {dogId, callerUid});
    return {success: true};
  } catch (error) {
    functions.logger.error("Failed to update dog record", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not update dog record.");
  }
});

/**
 * Transfers a dog from hospital to an adoption agency.
 * Can be called by: hospital_admin, platform_admin
 */
exports.transferDog = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection("Users").doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerData = callerSnap.data();
  const callerRole = callerData.role;

  if (!["platform_admin", "hospital_admin"].includes(callerRole)) {
    throw new functions.https.HttpsError("permission-denied", "Only hospital administrators or platform admin can transfer dogs.");
  }

  const dogId = requireNonEmptyString(data.dogId, "dogId");
  const targetAgencyId = requireNonEmptyString(data.agencyId, "agencyId");

  const dogRef = db.collection("Dogs").doc(dogId);
  const dogSnap = await dogRef.get();
  if (!dogSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Dog record not found.");
  }

  // Verify target agency exists
  const agencySnap = await db.collection("Organizations").doc(targetAgencyId).get();
  if (!agencySnap.exists || agencySnap.data().type !== "agency") {
    throw new functions.https.HttpsError("not-found", "Target adoption agency not found.");
  }

  try {
    const transferEntry = {
      date: new Date().toISOString(),
      type: "transfer",
      notes: `Transferred to ${agencySnap.data().name} for adoption/shelter care.`,
      recorded_by: callerUid,
      recorded_by_name: callerData.full_name || "Unknown",
      hospital_id: callerData.works_at || null,
    };

    await dogRef.update({
      status: "adoptable",
      agency_id: targetAgencyId,
      treatment_timeline: FieldValue.arrayUnion(transferEntry),
      updated_at: FieldValue.serverTimestamp(),
    });

    functions.logger.info("Dog transferred to agency", {dogId, agencyId: targetAgencyId});
    return {success: true};
  } catch (error) {
    functions.logger.error("Failed to transfer dog", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not transfer dog.");
  }
});

/**
 * Processes a dog adoption, storing private adopter details in a subcollection.
 * Can be called by: agency_admin, platform_admin
 */
exports.processAdoption = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerUid = context.auth.uid;
  const callerSnap = await db.collection("Users").doc(callerUid).get();
  if (!callerSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "Caller profile not found.");
  }

  const callerData = callerSnap.data();
  const callerRole = callerData.role;
  const callerOrgId = callerData.works_at || null;

  if (!["platform_admin", "agency_admin"].includes(callerRole)) {
    throw new functions.https.HttpsError("permission-denied", "Only agency administrators or platform admin can process adoptions.");
  }

  const dogId = requireNonEmptyString(data.dogId, "dogId");
  const adopterName = requireNonEmptyString(data.adopterName, "adopterName");
  const email = (data.email || "").trim();
  const phone = (data.phone || "").trim();
  const address = (data.address || "").trim();
  const notes = (data.notes || "").trim();

  const dogRef = db.collection("Dogs").doc(dogId);
  const dogSnap = await dogRef.get();
  if (!dogSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Dog record not found.");
  }

  if (callerRole !== "platform_admin" && dogSnap.data().agency_id !== callerOrgId) {
    throw new functions.https.HttpsError("permission-denied", "You can only process adoptions for dogs at your agency.");
  }

  try {
    const adoptionEntry = {
      date: new Date().toISOString(),
      type: "adoption",
      notes: "Dog has been adopted and found a forever home!",
      recorded_by: callerUid,
      recorded_by_name: callerData.full_name || "Unknown",
      agency_id: callerOrgId,
    };

    const batch = db.batch();

    // 1. Update public dog status
    batch.update(dogRef, {
      status: "adopted",
      treatment_timeline: FieldValue.arrayUnion(adoptionEntry),
      updated_at: FieldValue.serverTimestamp(),
    });

    // 2. Save private adopter details in a subcollection
    const privateRecordRef = dogRef.collection("AdoptionDetails").doc("record");
    batch.set(privateRecordRef, {
      adopter_name: adopterName,
      email,
      phone,
      address,
      notes,
      processed_by: callerUid,
      processed_by_name: callerData.full_name || "Unknown",
      agency_id: callerOrgId,
      processed_at: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    functions.logger.info("Adoption processed", {dogId, agencyId: callerOrgId});
    return {success: true};
  } catch (error) {
    functions.logger.error("Failed to process adoption", error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError("internal", error.message || "Could not process adoption.");
  }
});
