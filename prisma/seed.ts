const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default settings
  const settings = await prisma.settings.create({
    data: {
      defaultCurrency: 'GBP',
      defaultCurrencySymbol: '£',
      invoicePrefix: 'A',
      nextInvoiceNumber: 2,
      contactEmail: 'info@example.com',
      contactPhone: '+880 123 456789',
      contactMessage: 'For any enquiry, reach out via email at',
    },
  });
  console.log('Settings created');

  // Create sample business
  const business = await prisma.business.create({
    data: {
      name: 'Example IT',
      address: 'Example 113, Dhaka 1209, Dhaka, Bangladesh',
      email: 'info@example.com',
      phone: '+880 123 456789',
      website: 'www.example.com',
      isDefault: true,
    },
  });
  console.log('Business created:', business.name);

  // Create sample client
  const client = await prisma.client.create({
    data: {
      name: 'Example Client',
      address: 'Example Address, Birmingham, England, United Kingdom (UK) - B10 0UN',
    },
  });
  console.log('Client created:', client.name);

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: 'A00001',
      invoiceDate: new Date(),
      status: 'paid',
      currency: 'GBP',
      currencySymbol: '£',
      subtotal: 200,
      total: 200,
      amountPaid: 200,
      showTotalInWords: true,
      businessId: business.id,
      clientId: client.id,
      items: {
        create: [
          {
            name: 'One Month SEO',
            description: 'February 1 - February 28',
            quantity: 1,
            rate: 200,
            amount: 200,
            unit: 'Service',
            sortOrder: 0,
          },
        ],
      },
    },
  });
  console.log('Invoice created:', invoice.invoiceNo);

  console.log('\nDone! Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });