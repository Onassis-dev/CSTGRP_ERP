import cron from 'node-cron';
import { otorgateVacations } from './functions';

cron.schedule('0 7-12 * * *', otorgateVacations);

otorgateVacations();
