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
import Subscriptions from '../../api/Subscriptions/Subscriptions';

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


const subs = Subscriptions.find({ 'delivery.6': { $exists: true } }).fetch();


for (let index = 0; index < subs[0].delivery.length; index++) {
  const e = subs[0].delivery[index];
  const previousDay = subs[0].delivery[index - 1];
  const dayBeforeYesterday = subs[0].delivery[index - 2];

  if (e == 'false') {
    continue;
  }

  if (index == 0) {

    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }

  } //monday

  if (index == 1) {
    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }
  } //tuesday

  if (index == 2) {
    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }
  } //wednesday

  if (index == 3) {
    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }
  } //thursday

  if (index == 4) {
    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }
  } //friday

  if (index == 5) {
    if (e == 'nightBefore') {

    } else if (e == 'dayOf') {

    }
  } //saturday-sunday


}
