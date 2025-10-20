import { db } from '../server/db';
import { 
  activities,
  paymentItems,
  productOffers,
  products,
  contacts,
  companies,
  deals,
  activityTypes,
  users
} from '../shared/schema';
import { eq } from 'drizzle-orm';

async function addMissingData() {
  console.log('🌱 Adding missing demo data...');

  try {
    const tenantId = 3; // Comfort Urban Residence tenant

    // Get user ID
    const [user] = await db.select().from(users).where(eq(users.email, 'hello@epesicloud.com')).limit(1);
    if (!user) {
      console.error('User not found!');
      return;
    }

    // Get some contacts, companies, deals for linking
    const contactList = await db.select().from(contacts).where(eq(contacts.tenantId, tenantId)).limit(10);
    const companyList = await db.select().from(companies).where(eq(companies.tenantId, tenantId)).limit(5);
    const dealList = await db.select().from(deals).where(eq(deals.tenantId, tenantId)).limit(8);
    const activityTypesList = await db.select().from(activityTypes).where(eq(activityTypes.tenantId, tenantId));

    // 1. Create Activities
    console.log('Creating activities...');
    const activityData = [
      {
        type: 'Call',
        subject: 'Initial call with Sarah Johnson',
        description: 'Discussed studio unit requirements and budget',
        contactId: contactList[0]?.id,
        dealId: dealList[0]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-15T10:00:00Z'),
        completedAt: new Date('2025-10-15T10:30:00Z'),
      },
      {
        type: 'Site Visit',
        subject: 'Site visit scheduled',
        description: 'Client wants to see the 2 bedroom convertible units',
        contactId: contactList[1]?.id,
        dealId: dealList[1]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-18T14:00:00Z'),
      },
      {
        type: 'Email',
        subject: 'Email sent - Payment plan details',
        description: 'Sent detailed payment schedule for 3 bed premium unit',
        contactId: contactList[2]?.id,
        dealId: dealList[2]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-16T09:30:00Z'),
        completedAt: new Date('2025-10-16T09:35:00Z'),
      },
      {
        type: 'Call',
        subject: 'Follow-up call - Negotiation phase',
        description: 'Discussed pricing options and payment terms',
        contactId: contactList[3]?.id,
        dealId: dealList[3]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-17T11:00:00Z'),
        completedAt: new Date('2025-10-17T11:20:00Z'),
      },
      {
        type: 'Meeting',
        subject: 'Virtual tour conducted',
        description: 'Showed 1 bed unit via video call to diaspora investor',
        contactId: contactList[4]?.id,
        dealId: dealList[4]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-19T16:00:00Z'),
        completedAt: new Date('2025-10-19T16:45:00Z'),
      },
      {
        type: 'SMS/WhatsApp',
        subject: 'Document submission reminder',
        description: 'WhatsApp message sent for KYC documents',
        contactId: contactList[5]?.id,
        dealId: dealList[5]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-20T08:00:00Z'),
        completedAt: new Date('2025-10-20T08:05:00Z'),
      },
      {
        type: 'Meeting',
        subject: 'Proposal presentation',
        description: 'Presented full proposal with financing options',
        contactId: contactList[6]?.id,
        dealId: dealList[6]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-14T13:00:00Z'),
        completedAt: new Date('2025-10-14T14:00:00Z'),
      },
      {
        type: 'Call',
        subject: 'Booking confirmation call',
        description: 'Confirmed reservation for Studio Unit',
        contactId: contactList[7]?.id,
        dealId: dealList[7]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-19T15:30:00Z'),
        completedAt: new Date('2025-10-19T15:45:00Z'),
      },
      {
        type: 'Email',
        subject: 'Site visit follow-up',
        description: 'Email thank you and additional project details',
        contactId: contactList[8]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-21T10:00:00Z'),
      },
      {
        type: 'Meeting',
        subject: 'Contract review meeting',
        description: 'Go through sales agreement with legal team',
        contactId: contactList[9]?.id,
        userId: user.id,
        assignedToId: user.id,
        tenantId,
        scheduledAt: new Date('2025-10-22T14:00:00Z'),
      },
    ];

    const createdActivities = await db.insert(activities).values(activityData).returning();
    console.log(`✓ Created ${createdActivities.length} activities`);

    // 2. Create Payment Items
    console.log('Creating payment items...');
    const paymentItemData = [
      {
        itemName: 'Booking Amount',
        description: 'Initial token payment to reserve property unit',
        isActive: true,
        tenantId,
      },
      {
        itemName: 'Down Payment',
        description: 'Initial down payment (typically 10-20% of unit price)',
        isActive: true,
        tenantId,
      },
      {
        itemName: 'Installment Payment',
        description: 'Regular installment as per payment plan',
        isActive: true,
        tenantId,
      },
      {
        itemName: 'Final Payment',
        description: 'Final payment before handover',
        isActive: true,
        tenantId,
      },
      {
        itemName: 'Registration Fees',
        description: 'Government registration and stamp duty',
        isActive: true,
        tenantId,
      },
      {
        itemName: 'Service Charge',
        description: 'Annual service and maintenance charge',
        isActive: true,
        tenantId,
      },
    ];

    const createdPaymentItems = await db.insert(paymentItems).values(paymentItemData).returning();
    console.log(`✓ Created ${createdPaymentItems.length} payment items`);

    // Get products for linking offers
    const productList = await db.select().from(products).where(eq(products.tenantId, tenantId));

    // 3. Create Product Offers
    console.log('Creating product offers...');
    const offerData = [
      {
        productId: productList[0]?.id, // Studio Unit
        name: 'Early Bird Discount - Studio Units',
        description: 'Save Ksh 100,000 on all studio units booked before end of October',
        discountType: 'fixed',
        discountValue: '100000.00',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-31'),
        isActive: true,
        tenantId,
      },
      {
        productId: productList[1]?.id, // 1 Bed Unit
        name: 'Cash Payment Discount',
        description: '5% discount on full cash payment (all unit types)',
        discountType: 'percentage',
        discountValue: '5.00',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        tenantId,
      },
      {
        productId: productList[2]?.id, // 2 Bed Convertible
        name: 'Referral Bonus Offer',
        description: 'Refer a buyer and get Ksh 50,000 off your next purchase',
        discountType: 'fixed',
        discountValue: '50000.00',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2026-03-31'),
        isActive: true,
        tenantId,
      },
      {
        productId: productList[3]?.id, // 3 Bed Premium
        name: 'Diaspora Investor Special',
        description: 'Special financing terms for diaspora investors',
        discountType: 'percentage',
        discountValue: '3.00',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        tenantId,
      },
    ];

    const createdOffers = await db.insert(productOffers).values(offerData).returning();
    console.log(`✓ Created ${createdOffers.length} product offers`);

    console.log('\n✅ Successfully added all missing demo data!');
    console.log('\nSummary:');
    console.log(`- ${createdActivities.length} Activities`);
    console.log(`- ${createdPaymentItems.length} Payment Items`);
    console.log(`- ${createdOffers.length} Product Offers`);

  } catch (error) {
    console.error('❌ Error adding demo data:', error);
    throw error;
  }
}

addMissingData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
