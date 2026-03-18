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

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'owner1@test.com',
      phone: '1234567890',
      password: hashedPassword,
      name: 'Business Owner 1',
      role: 'CLIENT',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'owner2@test.com',
      phone: '0987654321',
      password: hashedPassword,
      name: 'Business Owner 2',
      role: 'CLIENT',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'lokkomotto@test.com',
      phone: '1112223333',
      password: hashedPassword,
      name: 'Lokko Motto Owner',
      role: 'CLIENT',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'alphawines@test.com',
      phone: '4445556666',
      password: hashedPassword,
      name: 'Alpha Wines Owner',
      role: 'CLIENT',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: 'mbikaagencies@test.com',
      phone: '7778889999',
      password: hashedPassword,
      name: 'Mbika Agencies Owner',
      role: 'CLIENT',
    },
  });

  const hardwareOwner = await prisma.user.create({
    data: {
      email: 'hardwareowner@test.com',
      phone: '1231231234',
      password: hashedPassword,
      name: 'Hardware Store Owner',
      role: 'CLIENT',
    },
  });

  const mrChipsOwner = await prisma.user.create({
    data: {
      email: 'mrchipsowner@test.com',
      phone: '4564564567',
      password: hashedPassword,
      name: 'MrChips Owner',
      role: 'CLIENT',
    },
  });

  const hotelOwner = await prisma.user.create({
    data: {
      email: 'hotelowner@test.com',
      phone: '7897897890',
      password: hashedPassword,
      name: 'Hotel Owner',
      role: 'CLIENT',
    },
  });

  // Create Businesses
  const lokkoMotto = await prisma.business.create({
    data: {
      name: 'Lokko Motto',
      description: 'A club that sells wines and spirits',
      category: 'SHOP',
      ownerId: user3.id,
    },
  });

  const alphaWines = await prisma.business.create({
    data: {
      name: 'Alpha Wines',
      description: 'Liquor store with a wide selection of wines',
      category: 'SHOP',
      ownerId: user4.id,
    },
  });

  const mbikaAgencies = await prisma.business.create({
    data: {
      name: 'Mbika Agencies',
      description: 'Your trusted partner for spirits and beverages',
      category: 'SHOP',
      ownerId: user5.id,
    },
  });

  const bodaBodaServices = await prisma.business.create({
    data: {
      name: 'Boda Boda Services',
      description: 'Fast and reliable transport services',
      category: 'SERVICE',
      ownerId: user2.id,
    },
  });

  const hardwareStore = await prisma.business.create({
    data: {
      name: 'Kerugoya Hardware',
      description: 'Your one-stop shop for all hardware needs.',
      category: 'HARDWARE',
      ownerId: hardwareOwner.id,
    },
  });

  const mrChips = await prisma.business.create({
    data: {
      name: 'MrChips',
      description: 'The best chips in town.',
      category: 'HOTEL',
      ownerId: mrChipsOwner.id,
    },
  });

  const grandHotel = await prisma.business.create({
    data: {
      name: 'Grand Hotel',
      description: 'Luxury hotel with a view.',
      category: 'HOTEL',
      ownerId: hotelOwner.id,
    },
  });


  // Create Products for Lokko Motto
  await prisma.product.createMany({
    data: [
      { name: 'Johnnie Walker Red Label (750ml)', description: 'Scotch Whisky', price: 2500, businessId: lokkoMotto.id },
      { name: 'Smirnoff Vodka (750ml)', description: 'Premium Vodka', price: 1800, businessId: lokkoMotto.id },
      { name: 'Gilbeys Gin (750ml)', description: 'Classic Gin', price: 1500, businessId: lokkoMotto.id },
      { name: 'Tusker Lager (500ml)', description: 'Local Beer', price: 250, businessId: lokkoMotto.id },
      { name: 'Guinness Stout (500ml)', description: 'Dark Beer', price: 300, businessId: lokkoMotto.id },
      { name: 'Four Cousins Sweet Red (750ml)', description: 'Sweet Red Wine', price: 1200, businessId: lokkoMotto.id },
      { name: 'K.C.B. Brandy (750ml)', description: 'Kenyan Brandy', price: 1000, businessId: lokkoMotto.id },
    ],
  });

  // Create Products for Alpha Wines
  await prisma.product.createMany({
    data: [
      { name: 'Nederburg Baronne (750ml)', description: 'Red Wine', price: 1300, businessId: alphaWines.id },
      { name: 'Cellar Cask Sweet White (5L)', description: 'Sweet White Wine', price: 2800, businessId: alphaWines.id },
      { name: 'Caprice Wine (750ml)', description: 'Assorted Flavors', price: 900, businessId: alphaWines.id },
      { name: 'Drostdy Hof Red (750ml)', description: 'Red Wine', price: 1100, businessId: alphaWines.id },
    ],
  });

  // Create Products for Mbika Agencies
  await prisma.product.createMany({
    data: [
      { name: 'Jack Daniels Old No. 7 (750ml)', description: 'Tennessee Whiskey', price: 3500, businessId: mbikaAgencies.id },
      { name: 'Bombay Sapphire Gin (750ml)', description: 'Premium Gin', price: 2200, businessId: mbikaAgencies.id },
      { name: 'Absolut Vodka (750ml)', description: 'Swedish Vodka', price: 2000, businessId: mbikaAgencies.id },
      { name: 'Jameson Irish Whiskey (750ml)', description: 'Irish Whiskey', price: 2800, businessId: mbikaAgencies.id },
    ],
  });

  // Create Products (Services) for Boda Boda Services
  await prisma.product.createMany({
    data: [
      { name: 'Town Trip', description: 'A trip within the town', price: 150, businessId: bodaBodaServices.id },
      { name: 'Parcel Delivery', description: 'Deliver a parcel within the town', price: 200, businessId: bodaBodaServices.id },
      { name: 'Shopping', description: 'We do the shopping for you', price: 300, businessId: bodaBodaServices.id },
    ],
  });

  // Create Products for Hardware Store
  await prisma.product.createMany({
    data: [
      { name: 'Hammer', description: 'A tool for pounding things.', price: 500, businessId: hardwareStore.id },
      { name: 'Screwdriver', description: 'A tool for turning screws.', price: 300, businessId: hardwareStore.id },
      { name: 'Wrench', description: 'A tool for turning nuts and bolts.', price: 400, businessId: hardwareStore.id },
    ],
  });

  // Create Products for MrChips
  await prisma.product.createMany({
    data: [
      { name: 'Chips', description: 'Plain chips.', price: 100, businessId: mrChips.id },
      { name: 'Chips Masala', description: 'Chips with masala sauce.', price: 150, businessId: mrChips.id },
      { name: 'Chips and Sausage', description: 'Chips with a sausage.', price: 200, businessId: mrChips.id },
    ],
  });

  // Create Products for Grand Hotel
  await prisma.product.createMany({
    data: [
      { name: 'Beef Stew', description: 'A hearty beef stew.', price: 500, businessId: grandHotel.id },
      { name: 'Chicken Curry', description: 'A spicy chicken curry.', price: 600, businessId: grandHotel.id },
      { name: 'Fish and Chips', description: 'Classic fish and chips.', price: 450, businessId: grandHotel.id },
    ],
  });

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
