require('dotenv').config();
const mongoose = require('mongoose');
const TimeWindowPrize = require('../models/TimeWindowPrize');

async function addMissingPrizes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const now = new Date();

    // Define missing prizes
    const missingPrizes = [
      { name: '1.000 Pontos no Club B', quantity: 11 },
      { name: '5.000 Pontos no Club B', quantity: 8 },
      { name: '10.000 Pontos no Club B', quantity: 8 },
      { name: '15.000 Pontos no Club B', quantity: 5 },
      { name: '20.000 Pontos no Club B', quantity: 5 },
      { name: '25.000 Pontos no Club B', quantity: 3 },
      { name: '30.000 Pontos no Club B', quantity: 4 },
      { name: 'Celular', quantity: 1 },
      { name: 'Mini Capacete', quantity: 4 }
    ];

    console.log('📦 Adding missing prizes:\n');

    let totalAdded = 0;

    for (const prize of missingPrizes) {
      console.log(`Adding ${prize.quantity}x ${prize.name}...`);

      const prizesToAdd = [];
      for (let i = 0; i < prize.quantity; i++) {
        prizesToAdd.push({
          prize_name: prize.name,
          draw_datetime: now, // Make them available immediately
          is_claimed: false,
          winner_user_id: null,
          claimed_at: null
        });
      }

      await TimeWindowPrize.insertMany(prizesToAdd);
      totalAdded += prize.quantity;
      console.log(`  ✅ Added ${prize.quantity} prizes`);
    }

    console.log(`\n✅ Total prizes added: ${totalAdded}`);

    // Verify the new totals
    console.log('\n🔍 Verifying new totals...\n');

    const allPrizes = await TimeWindowPrize.find({});
    const prizeStats = {};

    allPrizes.forEach(prize => {
      if (!prizeStats[prize.prize_name]) {
        prizeStats[prize.prize_name] = {
          total: 0,
          claimed: 0,
          unclaimed: 0
        };
      }
      prizeStats[prize.prize_name].total++;
      if (prize.is_claimed) {
        prizeStats[prize.prize_name].claimed++;
      } else {
        prizeStats[prize.prize_name].unclaimed++;
      }
    });

    console.log('Prize Name                          | Total | Claimed | Available');
    console.log('─'.repeat(70));

    let grandTotal = 0;
    let grandClaimed = 0;
    let grandAvailable = 0;

    Object.entries(prizeStats).sort().forEach(([name, stats]) => {
      grandTotal += stats.total;
      grandClaimed += stats.claimed;
      grandAvailable += stats.unclaimed;
      console.log(
        `${name.padEnd(35)} | ${stats.total.toString().padStart(5)} | ${stats.claimed.toString().padStart(7)} | ${stats.unclaimed.toString().padStart(9)}`
      );
    });

    console.log('─'.repeat(70));
    console.log(
      `${'TOTAL'.padEnd(35)} | ${grandTotal.toString().padStart(5)} | ${grandClaimed.toString().padStart(7)} | ${grandAvailable.toString().padStart(9)}`
    );

    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMissingPrizes();
