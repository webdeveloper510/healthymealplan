import './accounts';
import './api';
// import './fixtures';
import './email';

import './jobs';
import './jobs/setSubscriptionActive';
import './jobs/setSubscriptionActiveCard';
import './jobs/createInvoices';

import '../../modules/server/authorize/webhooks/';

import Jobs from '../../api/Jobs/Jobs';

const job = new Job(Jobs, 'createInvoices', {});

const createInvoicesExists = Jobs.findOne({ type: 'createInvoices' });

// console.log(createInvoicesExists);

if (!createInvoicesExists) {
  job
    .priority('normal')
    .repeat({
      schedule: Jobs.later.parse.cron('0 8 * * 6'),
    })
    .save();
} // Commit it to the server
