// ═══════════════════════════════════════════════════════════
// SEED DATA — Populates the database with initial content
// ═══════════════════════════════════════════════════════════
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Categories ──
  const categories = [
    { slug: 'blood', name: 'Blood Tests', nameAr: 'تحاليل الدم', icon: '🩸', description: 'Complete blood work and hematology' },
    { slug: 'radiology', name: 'Radiology / X-Ray', nameAr: 'أشعة', icon: '📡', description: 'Digital X-Ray imaging' },
    { slug: 'mri', name: 'MRI Scans', nameAr: 'رنين مغناطيسي', icon: '🧲', description: 'Magnetic Resonance Imaging' },
    { slug: 'ct', name: 'CT Scans', nameAr: 'أشعة مقطعية', icon: '🔬', description: 'Computed Tomography scans' },
    { slug: 'ultrasound', name: 'Ultrasound', nameAr: 'موجات صوتية', icon: '🫧', description: 'Sonography & Doppler imaging' },
    { slug: 'cardiac', name: 'Cardiac Tests', nameAr: 'فحوصات القلب', icon: '❤️', description: 'ECG, Echo, and cardiac panels' },
    { slug: 'hormones', name: 'Hormones Panel', nameAr: 'تحاليل الهرمونات', icon: '⚗️', description: 'Thyroid, reproductive, adrenal' },
    { slug: 'packages', name: 'Health Packages', nameAr: 'باقات الفحص الشامل', icon: '📦', description: 'Comprehensive health screening bundles' },
  ];
  categories.forEach(c => db.categories.create(c));
  console.log(`  ✓ ${categories.length} categories`);

  // ── Providers ──
  const providers = [
    { name: 'Cairo Diagnostic Center', nameAr: 'مركز القاهرة التشخيصي', type: 'lab', rating: 4.8, reviewCount: 1243, location: 'Nasr City, Cairo', city: 'Cairo', lat: 30.06, lng: 31.34, verified: true, capAccredited: true, services: ['blood','hormones','cardiac','packages'], priceRange: '$$', homeCollection: true, insurance: ['MetLife','AXA','Allianz'], avgWaitTime: '30 min', openHours: '08:00-22:00', phone: '+20-2-2345-6789', email: 'info@cairodiag.com', priceModifier: 0, description: 'Leading CAP-accredited diagnostic center in Nasr City with state-of-the-art equipment.' },
    { name: 'Nile Radiology & Imaging', nameAr: 'النيل للأشعة والتصوير', type: 'imaging', rating: 4.9, reviewCount: 876, location: 'Dokki, Giza', city: 'Giza', lat: 30.04, lng: 31.21, verified: true, capAccredited: false, services: ['radiology','mri','ct','ultrasound'], priceRange: '$$$', homeCollection: false, insurance: ['MetLife','AXA'], avgWaitTime: '45 min', openHours: '07:00-23:00', phone: '+20-2-3456-7890', email: 'info@nileradiology.com', priceModifier: 50, description: 'Premium imaging center with Siemens 3T MRI and 128-slice CT.' },
    { name: 'Alexandria Medical Labs', nameAr: 'معامل الإسكندرية الطبية', type: 'lab', rating: 4.6, reviewCount: 654, location: 'Smouha, Alexandria', city: 'Alexandria', lat: 31.22, lng: 29.95, verified: true, capAccredited: false, services: ['blood','hormones','packages'], priceRange: '$', homeCollection: true, insurance: ['Allianz'], avgWaitTime: '20 min', openHours: '08:00-20:00', phone: '+20-3-4567-8901', email: 'info@alexmedlabs.com', priceModifier: -30, description: 'Affordable lab services across Alexandria with home collection.' },
    { name: 'Pyramids Scan Center', nameAr: 'مركز الأهرام للأشعة', type: 'imaging', rating: 4.7, reviewCount: 432, location: '6th October, Giza', city: 'Giza', lat: 29.97, lng: 31.01, verified: true, capAccredited: false, services: ['mri','ct','ultrasound','radiology'], priceRange: '$$', homeCollection: false, insurance: ['MetLife','AXA','Allianz','Bupa'], avgWaitTime: '60 min', openHours: '09:00-21:00', phone: '+20-2-5678-9012', email: 'info@pyramidsscan.com', priceModifier: 20, description: 'Modern imaging center serving 6th October and Sheikh Zayed.' },
    { name: 'Delta Health Laboratory', nameAr: 'معمل دلتا الصحة', type: 'lab', rating: 4.5, reviewCount: 321, location: 'Mansoura, Dakahlia', city: 'Mansoura', lat: 31.04, lng: 31.38, verified: false, capAccredited: false, services: ['blood','hormones','cardiac','packages'], priceRange: '$', homeCollection: true, insurance: ['MetLife'], avgWaitTime: '15 min', openHours: '08:00-18:00', phone: '+20-50-123-4567', email: 'info@deltahealth.com', priceModifier: -50, description: 'Trusted local lab in Mansoura with fast turnaround.' },
    { name: 'Smart Imaging Center', nameAr: 'مركز سمارت للتصوير الطبي', type: 'imaging', rating: 4.9, reviewCount: 567, location: 'Heliopolis, Cairo', city: 'Cairo', lat: 30.09, lng: 31.32, verified: true, capAccredited: true, services: ['mri','ct','radiology','ultrasound'], priceRange: '$$$', homeCollection: false, insurance: ['MetLife','AXA','Allianz','Bupa','GIG'], avgWaitTime: '35 min', openHours: '07:00-23:00', phone: '+20-2-6789-0123', email: 'info@smartimaging.com', priceModifier: 80, description: 'Premium diagnostic imaging with AI-assisted reporting.' },
    { name: 'Maadi Medical Lab', nameAr: 'معمل المعادي الطبي', type: 'lab', rating: 4.7, reviewCount: 489, location: 'Maadi, Cairo', city: 'Cairo', lat: 29.96, lng: 31.25, verified: true, capAccredited: false, services: ['blood','hormones','cardiac'], priceRange: '$$', homeCollection: true, insurance: ['AXA','Allianz','GIG'], avgWaitTime: '25 min', openHours: '07:00-22:00', phone: '+20-2-7890-1234', email: 'info@maadimedlab.com', priceModifier: 10, description: 'Trusted neighborhood lab serving Maadi and New Cairo.' },
    { name: 'Tanta Scan Center', nameAr: 'مركز طنطا للأشعة', type: 'imaging', rating: 4.4, reviewCount: 198, location: 'Tanta, Gharbia', city: 'Tanta', lat: 30.79, lng: 30.99, verified: false, capAccredited: false, services: ['radiology','ct','ultrasound'], priceRange: '$', homeCollection: false, insurance: ['MetLife'], avgWaitTime: '40 min', openHours: '09:00-20:00', phone: '+20-40-234-5678', email: 'info@tantascan.com', priceModifier: -40, description: 'Affordable imaging services in Gharbia governorate.' },
  ];
  const providerIds = {};
  providers.forEach(p => {
    const created = db.providers.create(p);
    providerIds[p.name] = created.id;
  });
  console.log(`  ✓ ${providers.length} providers`);

  // ── Tests ──
  const labProviders = Object.entries(providerIds).filter(([name]) => ['Cairo Diagnostic Center','Alexandria Medical Labs','Delta Health Laboratory','Maadi Medical Lab'].includes(name)).map(([,id]) => id);
  const imagingProviders = Object.entries(providerIds).filter(([name]) => ['Nile Radiology & Imaging','Pyramids Scan Center','Smart Imaging Center','Tanta Scan Center'].includes(name)).map(([,id]) => id);

  const tests = [
    { name: 'Complete Blood Count (CBC)', nameAr: 'صورة دم كاملة', category: 'blood', basePrice: 120, turnaround: '4 hours', popular: true, bookingCount: 1562, keywords: ['cbc','blood count','wbc','rbc','hemoglobin','دم'], providerIds: labProviders, preparation: 'No special preparation needed. Fasting not required.' },
    { name: 'Thyroid Function (TSH, T3, T4)', nameAr: 'وظائف الغدة الدرقية', category: 'hormones', basePrice: 350, turnaround: '24 hours', popular: true, bookingCount: 987, keywords: ['thyroid','tsh','t3','t4','غدة درقية'], providerIds: labProviders, preparation: 'Morning blood draw preferred. Some medications may need to be paused.' },
    { name: 'Brain MRI with Contrast', nameAr: 'رنين مغناطيسي على المخ بالصبغة', category: 'mri', basePrice: 2800, turnaround: '48 hours', popular: true, bookingCount: 432, keywords: ['brain mri','head mri','مخ','رنين','contrast'], providerIds: imagingProviders, preparation: 'Remove all metal. Inform staff of implants or pacemakers. 4-hour fast if contrast used.' },
    { name: 'Chest X-Ray (PA & Lateral)', nameAr: 'أشعة على الصدر', category: 'radiology', basePrice: 250, turnaround: '2 hours', popular: false, bookingCount: 876, keywords: ['chest xray','lung','صدر','أشعة'], providerIds: imagingProviders, preparation: 'No special preparation. Remove jewelry and metal objects.' },
    { name: 'Abdominal Ultrasound', nameAr: 'سونار على البطن', category: 'ultrasound', basePrice: 400, turnaround: 'Immediate', popular: true, bookingCount: 1234, keywords: ['ultrasound','sonogram','abdomen','بطن','سونار'], providerIds: imagingProviders, preparation: 'Fast for 6-8 hours. Drink 4-6 glasses of water 1 hour before (keep bladder full).' },
    { name: 'Lipid Profile (Cholesterol Panel)', nameAr: 'تحليل الدهون والكوليسترول', category: 'blood', basePrice: 200, turnaround: '6 hours', popular: true, bookingCount: 1543, keywords: ['lipid','cholesterol','ldl','hdl','triglycerides','دهون','كوليسترول'], providerIds: labProviders, preparation: 'Fast for 9-12 hours before blood draw. Water is allowed.' },
    { name: 'HbA1c (Glycated Hemoglobin)', nameAr: 'السكر التراكمي', category: 'blood', basePrice: 180, turnaround: '4 hours', popular: true, bookingCount: 2100, keywords: ['hba1c','diabetes','sugar','سكر','تراكمي'], providerIds: labProviders, preparation: 'No fasting required.' },
    { name: 'CT Scan - Abdomen & Pelvis', nameAr: 'أشعة مقطعية على البطن والحوض', category: 'ct', basePrice: 1800, turnaround: '24 hours', popular: false, bookingCount: 345, keywords: ['ct scan','abdomen','pelvis','مقطعية','بطن','حوض'], providerIds: imagingProviders, preparation: 'Fast for 4 hours. Inform about allergies. May require contrast dye.' },
    { name: 'Echocardiogram (Echo)', nameAr: 'إيكو على القلب', category: 'cardiac', basePrice: 600, turnaround: 'Immediate', popular: true, bookingCount: 567, keywords: ['echo','echocardiogram','heart','قلب','إيكو'], providerIds: [providerIds['Cairo Diagnostic Center'], providerIds['Smart Imaging Center'], providerIds['Maadi Medical Lab']].filter(Boolean), preparation: 'No special preparation needed.' },
    { name: 'Comprehensive Health Package', nameAr: 'باقة الفحص الشامل', category: 'packages', basePrice: 1500, turnaround: '48 hours', popular: true, bookingCount: 1890, keywords: ['checkup','comprehensive','package','فحص شامل','باقة'], providerIds: labProviders, preparation: 'Fast for 12 hours. Bring list of current medications.' },
    { name: 'Vitamin D Test', nameAr: 'تحليل فيتامين د', category: 'blood', basePrice: 280, turnaround: '24 hours', popular: true, bookingCount: 1678, keywords: ['vitamin d','25-oh','فيتامين د'], providerIds: labProviders, preparation: 'No fasting required.' },
    { name: 'Knee MRI', nameAr: 'رنين مغناطيسي على الركبة', category: 'mri', basePrice: 2200, turnaround: '48 hours', popular: false, bookingCount: 234, keywords: ['knee mri','ركبة','رنين'], providerIds: imagingProviders, preparation: 'Remove metal objects. No contrast typically needed.' },
    { name: 'Liver Function Tests (LFT)', nameAr: 'وظائف الكبد', category: 'blood', basePrice: 250, turnaround: '6 hours', popular: true, bookingCount: 987, keywords: ['liver','lft','alt','ast','كبد','وظائف'], providerIds: labProviders, preparation: 'Fast for 8-12 hours.' },
    { name: 'Kidney Function Tests', nameAr: 'وظائف الكلى', category: 'blood', basePrice: 220, turnaround: '6 hours', popular: true, bookingCount: 876, keywords: ['kidney','bun','creatinine','كلى','وظائف'], providerIds: labProviders, preparation: 'Fast for 8-12 hours recommended.' },
    { name: 'Pelvic Ultrasound', nameAr: 'سونار على الحوض', category: 'ultrasound', basePrice: 450, turnaround: 'Immediate', popular: false, bookingCount: 654, keywords: ['pelvic','ovary','uterus','حوض','سونار','رحم'], providerIds: imagingProviders, preparation: 'Full bladder required. Drink 4-6 glasses of water 1 hour before.' },
    { name: 'Spine MRI (Lumbar)', nameAr: 'رنين مغناطيسي على الفقرات القطنية', category: 'mri', basePrice: 2500, turnaround: '48 hours', popular: false, bookingCount: 321, keywords: ['spine','lumbar','back','فقرات','ظهر','رنين'], providerIds: imagingProviders, preparation: 'Remove all metal. Inform staff of any implants.' },
    { name: 'Pregnancy Package (Trimester 1)', nameAr: 'باقة الحمل - الثلث الأول', category: 'packages', basePrice: 1200, turnaround: '48 hours', popular: true, bookingCount: 543, keywords: ['pregnancy','prenatal','حمل','حامل'], providerIds: labProviders, preparation: 'Fast for 8 hours. Morning appointment preferred.' },
    { name: 'CT Brain (without contrast)', nameAr: 'أشعة مقطعية على المخ بدون صبغة', category: 'ct', basePrice: 1200, turnaround: '12 hours', popular: true, bookingCount: 456, keywords: ['ct brain','head ct','مقطعية','مخ'], providerIds: imagingProviders, preparation: 'No special preparation needed.' },
    { name: 'ESR (Erythrocyte Sedimentation Rate)', nameAr: 'سرعة ترسيب الدم', category: 'blood', basePrice: 80, turnaround: '2 hours', popular: false, bookingCount: 765, keywords: ['esr','sedimentation','ترسيب'], providerIds: labProviders, preparation: 'No fasting required.' },
    { name: 'ECG (Electrocardiogram)', nameAr: 'رسم القلب', category: 'cardiac', basePrice: 150, turnaround: 'Immediate', popular: true, bookingCount: 1234, keywords: ['ecg','ekg','electrocardiogram','رسم قلب'], providerIds: [providerIds['Cairo Diagnostic Center'], providerIds['Maadi Medical Lab']].filter(Boolean), preparation: 'No special preparation. Avoid exercise 30 minutes before.' },
  ];
  tests.forEach(t => db.tests.create(t));
  console.log(`  ✓ ${tests.length} tests`);

  // ── Admin User ──
  const adminPassword = await bcrypt.hash('admin123', 10);
  db.users.create({ name: 'Admin', email: 'admin@tahleelionline.com', phone: '+20-100-000-0000', password: adminPassword, role: 'admin', insurance: [], savedTests: [], preferences: { language: 'en', notifications: true } });

  // ── Demo Provider User ──
  const providerPassword = await bcrypt.hash('provider123', 10);
  db.users.create({ name: 'Cairo Diagnostic Center', email: 'provider@cairodiag.com', phone: '+20-2-2345-6789', password: providerPassword, role: 'provider', providerId: providerIds['Cairo Diagnostic Center'], insurance: [], savedTests: [], preferences: { language: 'en', notifications: true } });

  // ── Demo Patient User ──
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = db.users.create({ name: 'Ahmed Mohamed', email: 'ahmed@example.com', phone: '+20-100-123-4567', password: patientPassword, role: 'patient', insurance: ['MetLife'], savedTests: [], preferences: { language: 'en', notifications: true } });

  // ── Sample Reviews ──
  const sampleReviews = [
    { userId: patient.id, userName: 'Ahmed M.', providerId: providerIds['Cairo Diagnostic Center'], rating: 5, text: 'Booked a CBC through the app — saved me time and got results on my phone the same day! Excellent service.' },
    { userId: patient.id, userName: 'Fatma S.', providerId: providerIds['Nile Radiology & Imaging'], rating: 5, text: 'Had my MRI here through TahleeliOnline. Price was 30% less than walk-in. Very professional staff.' },
    { userId: patient.id, userName: 'Dr. Hassan K.', providerId: providerIds['Cairo Diagnostic Center'], rating: 5, text: 'I recommend TahleeliOnline to all my patients. They upload the prescription and everything is handled.' },
    { userId: patient.id, userName: 'Mona A.', providerId: providerIds['Pyramids Scan Center'], rating: 4, text: 'Great for booking CT scans. Would love more centers in Upper Egypt. Fast and reliable.' },
    { userId: patient.id, userName: 'Youssef T.', providerId: providerIds['Alexandria Medical Labs'], rating: 5, text: 'Finally a platform where I can compare lab prices in Alex. The home collection service was excellent.' },
    { userId: patient.id, userName: 'Sara E.', providerId: providerIds['Smart Imaging Center'], rating: 5, text: 'State of the art MRI machine. Results were incredibly detailed. Booking through the app was seamless.' },
    { userId: patient.id, userName: 'Khaled N.', providerId: providerIds['Maadi Medical Lab'], rating: 4, text: 'Good lab with fast turnaround. Home collection phlebotomist was very professional.' },
    { userId: patient.id, userName: 'Nour H.', providerId: providerIds['Delta Health Laboratory'], rating: 4, text: 'Affordable and reliable. Great option for basic blood tests in Mansoura.' },
  ];
  sampleReviews.forEach(r => db.reviews.create(r));
  console.log(`  ✓ ${sampleReviews.length} reviews`);

  // ── Sample Bookings ──
  const allTests = db.tests.findAll();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const sampleBookings = [
    { bookingCode: 'THL-38271', userId: patient.id, userName: 'Ahmed M.', testId: allTests[0]?.id, testName: 'Complete Blood Count (CBC)', testNameAr: 'صورة دم كاملة', providerId: providerIds['Cairo Diagnostic Center'], providerName: 'Cairo Diagnostic Center', providerLocation: 'Nasr City, Cairo', date: today, timeSlot: '10:30', amount: 120, paymentMethod: 'fawry', homeCollection: false, status: 'confirmed', resultStatus: 'pending' },
    { bookingCode: 'THL-38272', userId: patient.id, userName: 'Fatma S.', testId: allTests[2]?.id, testName: 'Brain MRI with Contrast', testNameAr: 'رنين مغناطيسي على المخ', providerId: providerIds['Nile Radiology & Imaging'], providerName: 'Nile Radiology & Imaging', providerLocation: 'Dokki, Giza', date: today, timeSlot: '14:00', amount: 2850, paymentMethod: 'credit_card', homeCollection: false, status: 'in-progress', resultStatus: 'pending' },
    { bookingCode: 'THL-38273', userId: patient.id, userName: 'Omar K.', testId: allTests[1]?.id, testName: 'Thyroid Function (TSH, T3, T4)', testNameAr: 'وظائف الغدة الدرقية', providerId: providerIds['Cairo Diagnostic Center'], providerName: 'Cairo Diagnostic Center', providerLocation: 'Nasr City, Cairo', date: tomorrow, timeSlot: '09:00', amount: 350, paymentMethod: 'vodafone_cash', homeCollection: true, status: 'confirmed', resultStatus: 'pending' },
    { bookingCode: 'THL-38274', userId: patient.id, userName: 'Mona A.', testId: allTests[3]?.id, testName: 'Chest X-Ray (PA & Lateral)', testNameAr: 'أشعة على الصدر', providerId: providerIds['Pyramids Scan Center'], providerName: 'Pyramids Scan Center', providerLocation: '6th October, Giza', date: tomorrow, timeSlot: '11:30', amount: 270, paymentMethod: 'pay_at_lab', homeCollection: false, status: 'confirmed', resultStatus: 'pending' },
    { bookingCode: 'THL-38275', userId: patient.id, userName: 'Hassan F.', testId: allTests[5]?.id, testName: 'Lipid Profile (Cholesterol)', testNameAr: 'تحليل الدهون', providerId: providerIds['Cairo Diagnostic Center'], providerName: 'Cairo Diagnostic Center', providerLocation: 'Nasr City, Cairo', date: '2026-03-24', timeSlot: '08:00', amount: 200, paymentMethod: 'fawry', homeCollection: false, status: 'confirmed', resultStatus: 'pending' },
  ];
  sampleBookings.forEach(b => db.bookings.create(b));
  console.log(`  ✓ ${sampleBookings.length} bookings`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin:    admin@tahleelionline.com / admin123');
  console.log('  Provider: provider@cairodiag.com / provider123');
  console.log('  Patient:  ahmed@example.com / patient123');
}

seed().catch(console.error);
