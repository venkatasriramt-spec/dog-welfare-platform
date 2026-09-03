export const ROLES = {
  platform_admin: 'Platform administrator',
  hospital_admin: 'Hospital administrator',
  agency_admin: 'Agency administrator',
  veterinarian: 'Veterinarian / Doctor',
  agency_employee: 'Agency Employee',
  community_member: 'Community member',
  pending_partner: 'Pending Partner',
  rejected_partner: 'Rejected Partner'
};

export const DOG_STATUSES = {
  street: 'Street / Reported',
  in_treatment: 'In Treatment',
  fit_for_discharge: 'Fit for Discharge / Transfer',
  adoptable: 'Available for Adoption',
  community_dog: 'Community Dog (Released)',
  adopted: 'Adopted'
};

export const BREED_OPTIONS = [
  'Indian Pariah / Indie',
  'Labrador Retriever',
  'German Shepherd',
  'Golden Retriever',
  'Beagle',
  'Pomeranian',
  'Rottweiler',
  'Doberman',
  'Dalmatian',
  'Pug',
  'Shih Tzu',
  'Cocker Spaniel',
  'Great Dane',
  'Boxer',
  'Husky',
  'Mixed Breed',
  'Unknown / Unidentified'
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Unknown'];

export const emptyForm = {
  name: '',
  location: '',
  description: ''
};

export const emptyDogForm = {
  name: '',
  breed: 'Indian Pariah / Indie',
  estimated_age: '',
  gender: 'Unknown',
  location_found: '',
  description: '',
  condition_notes: '',
  is_vaccinated: false,
  is_neutered: false
};
