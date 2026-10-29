require('dotenv').config();
const mongoose = require('mongoose');
const TimeWindowPrizeNestle = require('../models/TimeWindowPrizeNestle');

async function prepareRemainingPrizes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const now = new Date();

    // 1. Find all unclaimed prizes
    const unclaimedPrizes = await TimeWindowPrizeNestle.find({
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    console.log(`📊 Found ${unclaimedPrizes.length} unclaimed prizes\n`);

    if (unclaimedPrizes.length === 0) {
      console.log('✅ All prizes have been claimed!');
      await mongoose.connection.close();
      return;
    }

    console.log('Unclaimed prizes:');
    unclaimedPrizes.forEach((prize, index) => {
      console.log(`  ${index + 1}. ${prize.prize_name} - draw_datetime: ${prize.draw_datetime.toISOString()}`);
    });

    // 2. Update all unclaimed prizes to NOW so they become immediately available
    console.log('\n🔄 Updating all unclaimed prizes to NOW...');

    const updateResult = await TimeWindowPrizeNestle.updateMany(
      { is_claimed: false },
      { $set: { draw_datetime: now } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} prizes to be available NOW\n`);

    // 3. Verify the update
    const availablePrizes = await TimeWindowPrizeNestle.find({
      draw_datetime: { $lte: now },
      is_claimed: false
    }).sort({ draw_datetime: 1 });

    console.log(`✅ Prizes now available for claiming: ${availablePrizes.length}`);
    console.log('\nBreakdown by prize type:');

    const breakdown = {};
    availablePrizes.forEach(prize => {
      if (!breakdown[prize.prize_name]) {
        breakdown[prize.prize_name] = 0;
      }
      breakdown[prize.prize_name]++;
    });

    Object.entries(breakdown).forEach(([name, count]) => {
      console.log(`  - ${name}: ${count}`);
    });

    console.log('\n⚠️  IMPORTANT:');
    console.log(`   - The next ${availablePrizes.length} users who play will WIN (100% guaranteed)`);
    console.log(`   - After these ${availablePrizes.length} prizes are claimed, NO ONE else can win`);
    console.log(`   - The system will return "No ganaste esta vez" when no prizes are available\n`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

prepareRemainingPrizes();
