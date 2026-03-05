import cron from 'node-cron';
import { otorgateVacations } from './functions';

cron.schedule('0 7-12 * * *', async () => {
  try {
    await otorgateVacations();
  } catch (error) {
    console.error('VACATIONS_ERROR:', error);
  }
});
