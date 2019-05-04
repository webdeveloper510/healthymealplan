import './accounts';
import './api';
import './email';

import './jobs';
import './jobs/setSubscriptionActive';
import './jobs/setSubscriptionActiveCard';
import './jobs/createInvoices';

import './jobs/setSubscriptionCancelledJob';
import './jobs/setSubscriptionActiveJob';
import './jobs/setSubscriptionPausedJob';

import './jobs/setSubscriptionCancelledCardJob';
import './jobs/setSubscriptionActiveCardJob';

import './jobs/editSubscriptionJob';
import './jobs/editSubscriptionJobNonCard';

import './jobs/enableDiscountJob';
import './jobs/disableDiscountJob';

import './jobs/sendFirstRecoveryEmailJob';

import '../../modules/server/authorize/webhooks/';

import './jobs/masterBillingJob';
import './jobs/slaveChargeJob';

S3 = {};

S3.config = {
  key: 'AKIAJAJSCSTOP6PEVJZA',
  secret: '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',
  bucket: 'vittle-new',
};

 // Jobs.setLogStream(process.stdout);