import './accounts';
import './api';
import './fixtures';
import './email';
import './jobs';
import './jobs/setSubscriptionActive';
import './jobs/createInvoices';

import Jobs from '../../api/Jobs/Jobs';

const job = new Job(Jobs, 'createInvoices', {});

job
  .priority('normal')
  .repeat({
    schedule: Jobs.later.parse.cron('0 8 * * 6'),
  })
  .save(); // Commit it to the server
