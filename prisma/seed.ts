import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: 'file:./prisma/dev.db'
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      phone: '0000000000',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  // Create Rider
  const rider = await prisma.user.upsert({
    where: { email: 'rider@test.com' },
    update: {},
    create: {
      email: 'rider@test.com',
      phone: '1111111111',
      password: hashedPassword,
      name: 'Professional Rider',
      role: 'RIDER',
      status: 'APPROVED',
      idNumber: 'ID123456',
      motorcyclePlateNumber: 'KMD 123A',
    },
  });

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'owner1@test.com' },
    update: {},
    create: {
      email: 'owner1@test.com',
      phone: '1234567890',
      password: hashedPassword,
      name: 'Business Owner 1',
      role: 'CLIENT',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'owner2@test.com' },
    update: {},
    create: {
      email: 'owner2@test.com',
      phone: '0987654321',
      password: hashedPassword,
      name: 'Business Owner 2',
      role: 'CLIENT',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'lokkomotto@test.com' },
    update: {},
    create: {
      email: 'lokkomotto@test.com',
      phone: '1112223333',
      password: hashedPassword,
      name: 'Lokko Motto Owner',
      role: 'CLIENT',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'alphawines@test.com' },
    update: {},
    create: {
      email: 'alphawines@test.com',
      phone: '4445556666',
      password: hashedPassword,
      name: 'Alpha Wines Owner',
      role: 'CLIENT',
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'mbikaagencies@test.com' },
    update: {},
    create: {
      email: 'mbikaagencies@test.com',
      phone: '7778889999',
      password: hashedPassword,
      name: 'Mbika Agencies Owner',
      role: 'CLIENT',
    },
  });

  const hardwareOwner = await prisma.user.upsert({
    where: { email: 'hardwareowner@test.com' },
    update: {},
    create: {
      email: 'hardwareowner@test.com',
      phone: '1231231234',
      password: hashedPassword,
      name: 'Hardware Store Owner',
      role: 'CLIENT',
    },
  });

  const mrChipsOwner = await prisma.user.upsert({
    where: { email: 'mrchipsowner@test.com' },
    update: {},
    create: {
      email: 'mrchipsowner@test.com',
      phone: '4564564567',
      password: hashedPassword,
      name: 'MrChips Owner',
      role: 'CLIENT',
    },
  });

  const hotelOwner = await prisma.user.upsert({
    where: { email: 'hotelowner@test.com' },
    update: {},
    create: {
      email: 'hotelowner@test.com',
      phone: '7897897890',
      password: hashedPassword,
      name: 'Hotel Owner',
      role: 'CLIENT',
    },
  });

  // Create Businesses
  const lokkoMotto = await prisma.business.upsert({
    where: { name: 'Lokko Motto' },
    update: {},
    create: {
      name: 'Lokko Motto',
      description: 'A club that sells wines and spirits',
      category: 'SHOP',
      ownerId: user3.id,
    },
  });

  const alphaWines = await prisma.business.upsert({
    where: { name: 'Alpha Wines' },
    update: {},
    create: {
      name: 'Alpha Wines',
      description: 'Liquor store with a wide selection of wines',
      category: 'SHOP',
      ownerId: user4.id,
    },
  });

  const mbikaAgencies = await prisma.business.upsert({
    where: { name: 'Mbika Agencies' },
    update: {},
    create: {
      name: 'Mbika Agencies',
      description: 'Your trusted partner for spirits and beverages',
      category: 'SHOP',
      ownerId: user5.id,
    },
  });

  const bodaBodaServices = await prisma.business.upsert({
    where: { name: 'Boda Boda Services' },
    update: {},
    create: {
      name: 'Boda Boda Services',
      description: 'Fast and reliable transport services',
      category: 'SERVICE',
      ownerId: user2.id,
    },
  });

  const hardwareStore = await prisma.business.upsert({
    where: { name: 'Kerugoya Hardware' },
    update: {},
    create: {
      name: 'Kerugoya Hardware',
      description: 'Your one-stop shop for all hardware needs.',
      category: 'HARDWARE',
      ownerId: hardwareOwner.id,
    },
  });

  const mrChips = await prisma.business.upsert({
    where: { name: 'MrChips' },
    update: {},
    create: {
      name: 'MrChips',
      description: 'The best chips in town.',
      category: 'HOTEL',
      ownerId: mrChipsOwner.id,
    },
  });

  const grandHotel = await prisma.business.upsert({
    where: { name: 'Grand Hotel' },
    update: {},
    create: {
      name: 'Grand Hotel',
      description: 'Luxury hotel with a view.',
      category: 'HOTEL',
      ownerId: hotelOwner.id,
    },
  });


  // Create Products for Lokko Motto
  const products = [
    { name: 'Johnnie Walker Red Label (750ml)', description: 'Scotch Whisky', price: 2500, businessId: lokkoMotto.id },
    { name: 'Smirnoff Vodka (750ml)', description: 'Premium Vodka', price: 1800, businessId: lokkoMotto.id },
    { name: 'Gilbeys Gin (750ml)', description: 'Classic Gin', price: 1500, businessId: lokkoMotto.id },
    { name: 'Tusker Lager (500ml)', description: 'Local Beer', price: 250, businessId: lokkoMotto.id },
    { name: 'Guinness Stout (500ml)', description: 'Dark Beer', price: 300, businessId: lokkoMotto.id },
    { name: 'Four Cousins Sweet Red (750ml)', description: 'Sweet Red Wine', price: 1200, businessId: lokkoMotto.id },
    { name: 'K.C.B. Brandy (750ml)', description: 'Kenyan Brandy', price: 1000, businessId: lokkoMotto.id },
    { name: 'Nederburg Baronne (750ml)', description: 'Red Wine', price: 1300, businessId: alphaWines.id },
    { name: 'Cellar Cask Sweet White (5L)', description: 'Sweet White Wine', price: 2800, businessId: alphaWines.id },
    { name: 'Caprice Wine (750ml)', description: 'Assorted Flavors', price: 900, businessId: alphaWines.id },
    { name: 'Drostdy Hof Red (750ml)', description: 'Red Wine', price: 1100, businessId: alphaWines.id },
    { name: 'Jack Daniels Old No. 7 (750ml)', description: 'Tennessee Whiskey', price: 3500, businessId: mbikaAgencies.id },
    { name: 'Bombay Sapphire Gin (750ml)', description: 'Premium Gin', price: 2200, businessId: mbikaAgencies.id },
    { name: 'Absolut Vodka (750ml)', description: 'Swedish Vodka', price: 2000, businessId: mbikaAgencies.id },
    { name: 'Jameson Irish Whiskey (750ml)', description: 'Irish Whiskey', price: 2800, businessId: mbikaAgencies.id },
    { name: 'Town Trip', description: 'A trip within the town', price: 150, businessId: bodaBodaServices.id },
    { name: 'Parcel Delivery', description: 'Deliver a parcel within the town', price: 200, businessId: bodaBodaServices.id },
    { name: 'Shopping', description: 'We do the shopping for you', price: 300, businessId: bodaBodaServices.id },
    { name: 'Hammer', description: 'A tool for pounding things.', price: 500, businessId: hardwareStore.id },
    { name: 'Screwdriver', description: 'A tool for turning screws.', price: 300, businessId: hardwareStore.id },
    { name: 'Wrench', description: 'A tool for turning nuts and bolts.', price: 400, businessId: hardwareStore.id },
    { name: 'Chips', description: 'Plain chips.', price: 100, businessId: mrChips.id },
    { name: 'Chips Masala', description: 'Chips with masala sauce.', price: 150, businessId: mrChips.id },
    { name: 'Chips and Sausage', description: 'Chips with a sausage.', price: 200, businessId: mrChips.id },
    { name: 'Beef Stew', description: 'A hearty beef stew.', price: 500, businessId: grandHotel.id },
    { name: 'Chicken Curry', description: 'A spicy chicken curry.', price: 600, businessId: grandHotel.id },
    { name: 'Fish and Chips', description: 'Classic fish and chips.', price: 450, businessId: grandHotel.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
