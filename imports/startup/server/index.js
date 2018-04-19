import './accounts';
import './api';
import './email';

import Jobs from '../../api/Jobs/Jobs';

import './jobs';
import './jobs/setSubscriptionActive';
import './jobs/setSubscriptionActiveCard';
import './jobs/createInvoices';

import './jobs/setSubscriptionCancelledJob';
import './jobs/setSubscriptionActiveJob';
import './jobs/setSubscriptionCancelledCardJob';
import './jobs/setSubscriptionActiveCardJob';
import './jobs/editSubscriptionJob';

import './jobs/enableDiscountJob';
import './jobs/disableDiscountJob';

import '../../modules/server/authorize/webhooks/';

S3 = {};

S3.config = {
  key: 'AKIAIPJLKGXALP74YF7Q',
  secret: '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',
  bucket: 'vittle-bucket',
  region: 'ca-central-1',
};
