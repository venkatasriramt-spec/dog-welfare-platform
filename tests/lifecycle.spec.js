import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function login(page, email, password = 'password123') {
  await page.goto('/');
  await page.getByRole('banner').getByRole('button', { name: 'Sign in →' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.locator('form').getByRole('button', { name: 'Sign in →' }).click({ force: true });
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 30000 });
}

async function logout(page) {
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in →' })).toBeVisible({ timeout: 30000 });
}

test.describe.serial('PawPath Full Lifecycle Tests', () => {

  test('Group A: Community Member reports 7 street dogs', async ({ page }) => {
    test.setTimeout(120000);
    await login(page, 'rahul.community@pawpath.demo');
    
    const dogs = [
      { name: 'Apollo', location: 'Marathahalli, Bangalore', breed: 'Pomeranian', gender: 'Male', age: 'Puppy (6 months)', desc: 'Puppy found crying alone near the garbage dump.', condition: 'Weak and scared, possible minor injuries.', img: 'Apollo.png' },
      { name: 'Fiona', location: 'BTM Layout, Bangalore', breed: 'Boxer', gender: 'Female', age: 'Adult (~2 years)', desc: 'Seen wandering around the layout for a few days.', condition: 'Skin infection visible, constantly scratching.', img: 'Fiona.png' },
      { name: 'Bella', location: 'Koramangala, Bangalore', breed: 'Labrador Retriever', gender: 'Female', age: 'Adult (~3 years)', desc: 'Friendly but injured dog.', condition: 'Limping on the back left leg, needs checking.', img: 'Bella.png' },
      { name: 'Gatsby', location: 'Indiranagar, Bangalore', breed: 'Golden Retriever', gender: 'Male', age: 'Adult (~5 years)', desc: 'Struck by a vehicle, laying on the pavement.', condition: 'Hit by a two-wheeler, lying on the side of the road.', img: 'Gatsby.png' },
      { name: 'Charlie', location: 'Jayanagar, Bangalore', breed: 'Boxer', gender: 'Female', age: 'Senior (8+ years)', desc: 'Needs urgent medical care.', condition: 'Weak and lethargic, refusing to eat.', img: 'Charlie.png' },
      { name: 'Hazel', location: 'Electronic City, Bangalore', breed: 'Indian Pariah / Indie', gender: 'Female', age: 'Adult (~3 years)', desc: 'Found tied to a fence.', condition: 'Collar on but no owner in sight for 2 days. Looks malnourished.', img: 'Hazel.png' },
      { name: 'Daisy', location: 'Hebbal, Bangalore', breed: 'Pug', gender: 'Female', age: 'Adult (~3 years)', desc: 'Lost pug wandering around.', condition: 'Seems healthy but lost.', img: 'Daisy.png' }
    ];

    for (const d of dogs) {
      await page.getByRole('button', { name: '📍 Report a dog' }).click();
      await page.getByLabel('Dog name or identifying detail *').fill(d.name);
      await page.getByLabel('Last seen location *').fill(d.location);
      await page.getByLabel('Breed (if known)').selectOption(d.breed);
      await page.getByLabel('Gender').selectOption(d.gender);
      await page.getByLabel('Estimated Age').fill(d.age);
      await page.getByLabel('What did you observe? *').fill(d.desc);
      await page.getByLabel('Condition notes (injuries, health concerns)').fill(d.condition);
      
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByLabel('Upload Photos & Videos (Optional)').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(__dirname, 'fixtures', d.img));
      
      await page.getByRole('button', { name: 'Submit report →' }).click();
      await expect(page.getByText('Your report has been successfully submitted')).toBeVisible({ timeout: 20000 });
      // Go to next dog
      await page.getByRole('button', { name: 'Report another' }).click();
    }
    
    await logout(page);
  });

  test('Group A: Hospital Admins admit reported dogs', async ({ page }) => {
    test.setTimeout(120000);
    // CityCare admits Apollo, Bella, Charlie
    await login(page, 'citycare.admin@pawpath.demo');
    await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    for (const name of ['Apollo', 'Bella', 'Charlie']) {
      await page.getByPlaceholder('Search queue...').fill(name);
      await page.getByRole('button', { name: 'View & Admit →' }).first().click();
      await page.getByRole('button', { name: '🏥 Confirm Admission →' }).click();
      await expect(page.getByText('Dog admitted to your hospital.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    }
    await logout(page);

    // Paws & Claws admits Fiona, Gatsby, Hazel
    await login(page, 'pawsclaws.admin@pawpath.demo');
    await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    for (const name of ['Fiona', 'Gatsby', 'Hazel']) {
      await page.getByPlaceholder('Search queue...').fill(name);
      await page.getByRole('button', { name: 'View & Admit →' }).first().click();
      await page.getByRole('button', { name: '🏥 Confirm Admission →' }).click();
      await expect(page.getByText('Dog admitted to your hospital.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    }
    
    // Daisy is ignored
    await page.getByPlaceholder('Search queue...').fill('Daisy');
    await expect(page.getByText('Daisy', { exact: true }).first()).toBeVisible();
    await logout(page);
  });

  test('Group B: Hospital Admins register walk-in patients', async ({ page }) => {
    test.setTimeout(120000);
    // CityCare walk-ins
    await login(page, 'citycare.admin@pawpath.demo');
    await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    
    const cityCareWalkIns = [
      { name: 'Kiki', location: 'Bellandur, Bangalore', breed: 'Cocker Spaniel', gender: 'Male', age: 'Senior (8+ years)', desc: 'Brought in by a good samaritan.', condition: 'Parvovirus treatment in isolation ward.', img: 'Kiki.png' },
      { name: 'Milo', location: 'Hebbal, Bangalore', breed: 'Dalmatian', gender: 'Male', age: 'Adult (~2 years)', desc: 'Injured in a fight.', condition: 'Wound management from dog bite.', img: 'Milo.png' }
    ];
    for (const d of cityCareWalkIns) {
      await page.getByRole('button', { name: '+ Register Walk-in Patient' }).first().click();
      await page.getByLabel('Dog name / Identifier *').fill(d.name);
      await page.getByLabel('Location found / Origin *').fill(d.location);
      await page.getByLabel('Breed').selectOption(d.breed);
      await page.getByLabel('Gender').selectOption(d.gender);
      await page.getByLabel('Estimated Age').fill(d.age);
      await page.getByLabel('Description / Notes').fill(d.desc);
      await page.getByLabel('Condition / Admission Notes').fill(d.condition);
      
      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByLabel('Upload Photos & Videos (Optional)').click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(path.join(__dirname, 'fixtures', d.img));
      
      await page.getByRole('button', { name: 'Register Dog →' }).click();
      await expect(page.getByRole('heading', { name: 'Admit Walk-in Dog to Hospital' })).not.toBeVisible({ timeout: 20000 });
    }
    await logout(page);

    // Paws & Claws walk-in
    await login(page, 'pawsclaws.admin@pawpath.demo');
    await page.getByRole('button', { name: '🚨 Incoming Queue' }).click();
    const d = { name: 'Rocky', location: 'JP Nagar, Bangalore', breed: 'Golden Retriever', gender: 'Female', age: 'Adult (~5 years)', desc: 'Elective surgery.', condition: 'Routine spay/neuter surgery recovery.', img: 'Rocky.png' };
    
    await page.getByRole('button', { name: '+ Register Walk-in Patient' }).first().click();
    await page.getByLabel('Dog name / Identifier *').fill(d.name);
    await page.getByLabel('Location found / Origin *').fill(d.location);
    await page.getByLabel('Breed').selectOption(d.breed);
    await page.getByLabel('Gender').selectOption(d.gender);
    await page.getByLabel('Estimated Age').fill(d.age);
    await page.getByLabel('Description / Notes').fill(d.desc);
    await page.getByLabel('Condition / Admission Notes').fill(d.condition);
    
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByLabel('Upload Photos & Videos (Optional)').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(__dirname, 'fixtures', d.img));
    
    await page.getByRole('button', { name: 'Register Dog →' }).click();
    await expect(page.getByRole('heading', { name: 'Admit Walk-in Dog to Hospital' })).not.toBeVisible({ timeout: 20000 });
    await logout(page);
  });

  test('Group B: Veterinarians add medical records', async ({ page }) => {
    test.setTimeout(120000);
    const vetActions = [
      // CityCare
      { user: 'sarah.vet@citycare.demo', dog: 'Apollo', d: 'Minor scrapes', p: 'Fluids', n: 'Resting comfortably' },
      { user: 'sarah.vet@citycare.demo', dog: 'Charlie', d: 'Kidney issues', p: 'IV fluids', n: 'Monitoring closely' },
      { user: 'sarah.vet@citycare.demo', dog: 'Kiki', d: 'Parvovirus', p: 'IV Fluids', n: 'Kept in isolation' },
      { user: 'sarah.vet@citycare.demo', dog: 'Milo', d: 'Dog bite wound', p: 'Antibiotics', n: 'Wound cleaned' },
      { user: 'rajesh.vet@citycare.demo', dog: 'Bella', d: 'Sprained leg', p: 'Pain meds', n: 'X-ray shows no fracture' },
      // Paws & Claws
      { user: 'amit.vet@pawsclaws.demo', dog: 'Fiona', d: 'Skin infection', p: 'Antibiotics and medicated bath', n: 'Scratching less' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Gatsby', d: 'Blunt force trauma', p: 'Painkillers', n: 'Stabilized, no internal bleeding' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Hazel', d: 'Malnutrition', p: 'Vitamin supplements', n: 'Feeding slowly, running blood tests' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Rocky', d: 'Routine Spay', p: 'Painkillers', n: 'Surgery successful' }
    ];

    let currentUser = null;
    for (const a of vetActions) {
      if (currentUser !== a.user) {
        if (currentUser) await logout(page);
        await login(page, a.user);
        currentUser = a.user;
      }
      
      await page.getByRole('button', { name: '🩺 Active Patients' }).click();
      await page.getByPlaceholder('Search by name, breed, tag, location...').fill(a.dog);
      await page.locator('.dog-card').filter({ hasText: a.dog }).getByRole('button', { name: 'Add medical record →' }).first().click();
      
      await page.getByRole('button', { name: '🩺 Add Medical Record' }).click();
      await page.getByLabel('Diagnosis').fill(a.d);
      await page.getByLabel('Prescription / Treatment').fill(a.p);
      await page.getByLabel('Clinical Notes').fill(a.n);
      await page.getByRole('button', { name: 'Save Medical Record →' }).click();
      await expect(page.getByText('Medical record updated successfully.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: '🩺 Active Patients' }).click();
    }
    
    await logout(page);
  });

  test('Group C: Medical Clearance & Transfer', async ({ page }) => {
    test.setTimeout(120000);
    // 1. Veterinarians clear dogs
    const clears = [
      { user: 'sarah.vet@citycare.demo', dog: 'Apollo' },
      { user: 'sarah.vet@citycare.demo', dog: 'Kiki' },
      { user: 'rajesh.vet@citycare.demo', dog: 'Bella' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Fiona' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Gatsby' },
      { user: 'amit.vet@pawsclaws.demo', dog: 'Rocky' },
    ];
    let currentUser = null;
    for (const c of clears) {
      if (currentUser !== c.user) {
        if (currentUser) await logout(page);
        await login(page, c.user);
        currentUser = c.user;
      }
      await page.getByRole('button', { name: '🩺 Active Patients' }).click();
      await page.getByPlaceholder('Search by name, breed, tag, location...').fill(c.dog);
      await page.locator('.dog-card').filter({ hasText: c.dog }).getByRole('button', { name: 'Add medical record →' }).first().click();
      await page.getByRole('button', { name: '🩺 Mark Fit for Discharge' }).first().click();
      // Click the nested confirm button
      await page.getByRole('button', { name: '🩺 Mark Fit for Discharge →' }).click();
      await expect(page.getByText('Dog marked as fit for discharge.')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: '🩺 Active Patients' }).click();
    }
    await logout(page);

    // 2. Hospital Admins Transfer
    const transfers = [
      { user: 'citycare.admin@pawpath.demo', dog: 'Apollo', agency: 'Happy Tails Rescue & Adoption' },
      { user: 'citycare.admin@pawpath.demo', dog: 'Bella', agency: 'Hope Street Dog Sanctuary' },
      { user: 'citycare.admin@pawpath.demo', dog: 'Kiki', agency: 'Happy Tails Rescue & Adoption' },
      { user: 'pawsclaws.admin@pawpath.demo', dog: 'Fiona', agency: 'Hope Street Dog Sanctuary' },
      { user: 'pawsclaws.admin@pawpath.demo', dog: 'Gatsby', agency: 'Happy Tails Rescue & Adoption' },
      { user: 'pawsclaws.admin@pawpath.demo', dog: 'Rocky', agency: 'Hope Street Dog Sanctuary' },
    ];
    currentUser = null;
    for (const t of transfers) {
      if (currentUser !== t.user) {
        if (currentUser) await logout(page);
        await login(page, t.user);
        currentUser = t.user;
      }
      await page.getByRole('button', { name: '🏡 Ready to Leave' }).click();
      await page.getByPlaceholder('Search ready dogs...').fill(t.dog);
      await page.locator('.dog-card').filter({ hasText: t.dog }).getByRole('button', { name: 'Process Discharge / Transfer →' }).click();
      await page.getByRole('button', { name: '🏡 Transfer to Agency' }).first().click();
      await page.getByLabel('Select Adoption Agency *').selectOption({ label: t.agency });
      await page.getByRole('button', { name: '🏡 Transfer to Agency →' }).click();
      await expect(page.getByText('Dog transferred to adoption agency successfully.')).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: '🏡 Ready to Leave' }).click();
    }
    await logout(page);
  });

  test('Group D: Shelter Intakes and Employee Notes', async ({ page }) => {
    test.setTimeout(120000);
    // 1. Shelter Intakes
    await login(page, 'happytails.admin@pawpath.demo');
    await page.getByRole('button', { name: '🏡 Current Residents' }).click();
    await page.getByRole('button', { name: '+ Register Walk-in Dog' }).click();
    await page.getByLabel('Dog name / Identifier *').fill('Zoe');
    await page.getByLabel('Location found / Origin *').fill('HSR Layout, Bangalore');
    await page.getByLabel('Breed').selectOption('Indian Pariah / Indie');
    await page.getByLabel('Gender').selectOption('Female');
    await page.getByLabel('Estimated Age').fill('Puppy (3 months)');
    await page.getByLabel('Description / Notes').fill('High energy, playful.');
    await page.getByLabel('Condition / Admission Notes').fill('Surrendered by previous owner. Healthy.');
    const fc1 = page.waitForEvent('filechooser');
    await page.getByLabel('Upload Photos & Videos (Optional)').click();
    (await fc1).setFiles(path.join(__dirname, 'fixtures', 'Zoe.png'));
    await page.getByRole('button', { name: 'Register Dog →' }).click();
    await expect(page.getByRole('heading', { name: 'Add Walk-in Dog to Agency' })).not.toBeVisible({ timeout: 20000 });
    await logout(page);

    await login(page, 'hopestreet.admin@pawpath.demo');
    await page.getByRole('button', { name: '🏡 Current Residents' }).click();
    await page.getByRole('button', { name: '+ Register Walk-in Dog' }).click();
    await page.getByLabel('Dog name / Identifier *').fill('Frankie');
    await page.getByLabel('Location found / Origin *').fill('JP Nagar, Bangalore');
    await page.getByLabel('Breed').selectOption('Labrador Retriever');
    await page.getByLabel('Gender').selectOption('Female');
    await page.getByLabel('Estimated Age').fill('Senior (10+ years)');
    await page.getByLabel('Description / Notes').fill('Calm and well-behaved.');
    await page.getByLabel('Condition / Admission Notes').fill('Healthy, recently groomed, very playful.');
    const fc2 = page.waitForEvent('filechooser');
    await page.getByLabel('Upload Photos & Videos (Optional)').click();
    (await fc2).setFiles(path.join(__dirname, 'fixtures', 'Frankie.png'));
    await page.getByRole('button', { name: 'Register Dog →' }).click();
    await expect(page.getByRole('heading', { name: 'Add Walk-in Dog to Agency' })).not.toBeVisible({ timeout: 20000 });
    await logout(page);

    // 2. Employee Notes
    const notes = [
      { user: 'priya.staff@happytails.demo', dog: 'Zoe', note: 'Very playful and eating well' },
      { user: 'priya.staff@happytails.demo', dog: 'Apollo', note: 'Settling in well, playful with other dogs.' },
      { user: 'maya.staff@hopestreet.demo', dog: 'Frankie', note: 'Sleeps most of the day, gentle' },
      { user: 'maya.staff@hopestreet.demo', dog: 'Fiona', note: 'Skin is healing beautifully, fur growing back.' },
      { user: 'maya.staff@hopestreet.demo', dog: 'Bella', note: 'Limp is gone, loves going for walks.' },
      { user: 'maya.staff@hopestreet.demo', dog: 'Rocky', note: 'Spay recovery complete, ready for a home.' },
      { user: 'alex.staff@happytails.demo', dog: 'Gatsby', note: 'Fully recovered from the accident, very gentle.' },
      { user: 'alex.staff@happytails.demo', dog: 'Kiki', note: 'Parvo survivor, now eating like a champ.' },
    ];
    let currentUser = null;
    for (const n of notes) {
      if (currentUser !== n.user) {
        if (currentUser) await logout(page);
        await login(page, n.user);
        currentUser = n.user;
      }
      await page.getByRole('button', { name: '🏡 Shelter Dogs' }).click();
      await page.getByPlaceholder('Search by name, breed, tag, location...').fill(n.dog);
      await page.locator('.dog-card').filter({ hasText: n.dog }).getByRole('button', { name: 'View record →' }).click();
      await page.getByRole('button', { name: '📝 Update Record' }).click();
      
      await page.getByLabel('Clinical Notes').fill(n.note);
      await page.getByRole('button', { name: 'Save Medical Record →' }).click();
      await expect(page.getByText('Medical record updated successfully.')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: '🏡 Shelter Dogs' }).click();
    }
    await logout(page);
  });

  test('Group E: Agency Admins process adoptions', async ({ page }) => {
    test.setTimeout(120000);
    const adoptions = [
      { user: 'happytails.admin@pawpath.demo', dog: 'Apollo', name: 'Rohan Gupta', phone: '9876543210' },
      { user: 'hopestreet.admin@pawpath.demo', dog: 'Fiona', name: 'Sneha Sharma', phone: '9876543211' },
      { user: 'happytails.admin@pawpath.demo', dog: 'Kiki', name: 'Amit Singh', phone: '9876543212' },
      { user: 'happytails.admin@pawpath.demo', dog: 'Zoe', name: 'Priya Kumar', phone: '9876543213' },
    ];
    let currentUser = null;
    for (const a of adoptions) {
      if (currentUser !== a.user) {
        if (currentUser) await logout(page);
        await login(page, a.user);
        currentUser = a.user;
      }
      await page.getByRole('button', { name: '🏡 Current Residents' }).click();
      await page.getByPlaceholder('Search dogs...').fill(a.dog);
      await page.locator('.dog-card').filter({ hasText: a.dog }).getByRole('button', { name: 'View & Manage Adoption →' }).click();
      
      await page.getByRole('button', { name: '❤️ Mark as Adopted' }).click();
      await page.getByLabel('Adopter Name *').fill(a.name);
      await page.getByLabel('Phone Number').fill(a.phone);
      await page.getByRole('button', { name: '❤️ Finalize Adoption →' }).click();
      
      await expect(page.getByText('Dog marked as adopted and details recorded!')).toBeVisible({ timeout: 15000 });
      await page.getByRole('button', { name: '🏡 Current Residents' }).click();
    }
    await logout(page);
  });
});
