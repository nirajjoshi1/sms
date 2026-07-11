require('dotenv').config();
const prisma = require('./src/config/prisma');

async function testModels() {
  try {
    console.log('Testing Prisma models...\n');

    // Test each settings model
    const models = [
      'generalSetting',
      'notificationSetting',
      'smsSetting',
      'emailSetting',
      'paymentSetting',
      'printSetting',
      'backup'
    ];

    for (const model of models) {
      try {
        const result = await prisma[model].findFirst();
        console.log(`✅ ${model}: OK (${result ? 'has data' : 'empty'})`);
      } catch (error) {
        console.log(`❌ ${model}: FAILED -`);
        console.error(error);
      }
    }

    console.log('\n✅ All models are accessible!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testModels();
