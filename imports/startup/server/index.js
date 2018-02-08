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

import moment from 'moment';

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


const subs = Subscriptions.find({ 'delivery.6': { $exists: true }, 'completeSchedule.6': { $exists: true } }).fetch();

subs.forEach((e, i) => {


});

const aggregation = Subscriptions.aggregate([
  {
    $match: {
      status: 'active',
      'completeSchedule.6': { $exists: true },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'customerId',
      foreignField: '_id',
      as: 'customer',
    },
  },
  {
    $lookup: {
      from: 'PostalCodes',
      localField: 'customer.postalCodeId',
      foreignField: '_id',
      as: 'postalCode',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'customer._id',
      foreignField: 'primaryAccount',
      as: 'secondaryProfiles',
    },
  },
  {
    $lookup: {
      from: 'Routes',
      localField: 'postalCode.route',
      foreignField: '_id',
      as: 'route',
    },
  },
]);

console.log(aggregation);

function modifyCurrentDelivery(key, value) {
  delivery[key] = value;
}

aggregation.forEach((el, i) => {

  // console.log('Current subscription');

  // console.log(el);

  // take out route id, subscription id, customer id,

  // take out each secondary profile from the customers secondary accounts that were aggregated


  // loop through delivery details on subscription
  // in the loop create documents for delivery and cooking

  const deliveries = [];
  const cooking = [];
  const daysPaired = [];


  for (let index = 0; index < el.delivery.length; index++) {

    const e = el.delivery[index];
    const previousDay = el.delivery[index - 1];
    const dayBeforeYesterday = el.delivery[index - 2];
    const nextDay = index < 6 ? el.delivery[index + 1] : null;
    const dayAfterTomorrow = index < 5 ? el.delivery[index + 2] : null;

    const delivery = {
      customerId: el.customerId,
      subscriptionId: el._id,
      postalCode: el.postalCode._id,
      routeId: el.postalCode.route,
      title: '',
      status: 'Scheduled',
      secondaryProfiles: el.secondaryProfiles,
    };


    if (e === 'false' || e === '') {
      continue;
    }

    if (index === 0) {

      if (e === 'nightBefore') {
        if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(1);
          daysPaired.push(2);
          // set delivery for monday tuesday and wednesday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().isoWeekday(7).format('MM-DD-YY');


          // set cooking as sunday


        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(2);
          // set delivery for monday and wednesday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().add(1, 'weeks').isoWeekday(1);

          // set cooking as sunday


        } else if (nextDay === 'nightBeforePaired') {
          daysPaired.push(1);
          // set delivery for monday and tuesday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().isoWeekday(7).format('MM-DD-YY');

          // set cooking as sunday

        } else {

          // set delivery for monday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().isoWeekday(7).format('MM-DD-YY');

          // set cooking as sunday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('MM-DD-YY');

        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(1);
          daysPaired.push(2);
          // set delivery for monday tuesday and wednesday as monday day
          // summation of monday tuesday and wednesday meals

          // set cooking for sunday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(2);
          // set delivery for monday and wednesday as monday day
          // summation of monday and wednesday meals


          // set cooking for sunday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(1);
          // set delivery for monday tuesday as monday day
          // summation of monday and and tuesday meals


          // set cooking as sunday

        } else {
          // set delivery for monday as monday day
          // sumation of monday meals


          // set cooking as sunday

        }
      }

    } // monday

    if (index === 1) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('MM-DD-YY');

        if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(2);
          daysPaired.push(3);
          // set delivery for tuesday, wednesday and thursday as monday night
          // summation of tuesday, wednesday and thursday meals


          // set cooking as monday

        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(3);
          // set delivery for tuesday and thursday as monday night
          // summation of tuesday and thursday meals


          // set cooking as monday

        } else if (nextDay === 'nightBeforePaired') {
          daysPaired.push(2);
          // set delivery for tuesday and wednesday as monday night
          // summation of tuesday and wednesday meals


          // set cooking as monday

        } else {
          // set delivery for tuesday as monday night
          // summation of tuesday meals

          // set cooking as monday

        }
      } else if (e === 'dayOf') {
        // set delivery as tuesday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('MM-DD-YY');

        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(2);
          daysPaired.push(3);
          // set delivery for tuesday, wednesday and thursday as tuesday day

          // summation of tuesday wednesday and thursday meals

          // set cooking as monday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(3);

          // set delivery for tuesday and thursday as tuesday day

          // summation of tuesday and thursday meals

          // set cooking as monday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(2);

          // set delivery for tuesday and wednesday as tuesday day

          // summation of tuesday and wednesday meals


          // set cooking as monday

        } else {

          // set delivery for tuesday as tuesday day

          // summation of tuesday meals

          // set cooking as monday

        }
      } else if (e === 'sundayNight') {
        // set delivery for tuesday as sunday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().isoWeekday(7).format('MM-DD-YY');
        // summation of tuesday meals

        // set cooking as sunday

      } else if (e === 'dayOfMonday') {
        // set delivery for tuesday as monday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('MM-DD-YY');

        // summation of tuesday meals


        // set cooking as sunday

      }
    } // tuesday

    if (index === 2) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('MM-DD-YY');


        if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for wednesday, thursday and friday as tuesday night

          // summation of wednesday thursday and friday meals

          // set cooking as tuesday

        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(4);
          // set delivery for wednesday and friday as tuesday night

          // summation of wednesday and friday meals


          // set cooking as tuesday

        } else if (nextDay === 'nightBeforePaired') {
          daysPaired.push(3);
          // set delivery for wednesday and thursday as tuesday night

          // summation of wednesday and thursay meals

          // set cooking as tuesday

        } else {
          // set delivery for wendesday as tuesday night

          // summation of wednesday meals

          // set cooking as tuesday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');


        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for wednesday, thursday and friday as wednesday day

          // summation of wednesday thursday and friday meals

          // set cooking as tuesday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(4);
          // set delivery for wednesday and friday as wednesday day

          // summation of wednesday and friday meals

          // set cooking as tuesday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(3);
          // set delivery for wednesday and thursday as wednesday day

          // summation of wednesday and thursday meals

          // set cooking as tuesday

        } else {
          // set delivery for wednesday as wednesday day


          // summation of wednesday meals

          // set cooking as tuesday

        }
      } else if (e === 'sundayNight') {
        // set delivery for wednesday as sunday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().isoWeekday(7).format('MM-DD-YY');

        // summation of wednesday meals

        // set cooking as sunday

      } else if (e === 'dayOfMonday') {
        // set delivery for wednesday as monday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('MM-DD-YY');

        // summation of wednesday meals

        // set cooking as sunday

      } else if (e === 'nightBeforeMonday') {
        // set delivery for wednesday as monday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');

        // summation of wednesday meals

        // set cooking as monday

      } else if (e === 'dayOfTuesday') {
        // set delivery for wednesday as tuesday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');

        // summation of wednesday meals


        // set cooking as monday

      }

    } // wednesday

    if (index === 3) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');

        if (nextDay === 'nightBeforePaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for thursday and friday as wednesday night

          // summation

          // set cooking as wednesday

        } else {
          // set delivery for thursday as wednesday night

          // summation

          // set cooking as wednesday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('MM-DD-YY');

        if (nextDay === 'dayOfPaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for thursday and friday as thursday day

          // set cooking as wednesday

        } else {
          // set delivery for thursday as thursday day

          // set cooking as wednesday

        }
      } else if (e === 'mondayNight') {
        // set delivery for thursday as monday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('MM-DD-YY');

        // set cooking as monday

      } else if (e === 'dayOfTuesday') {
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('MM-DD-YY');
        // set delivery for thursday as tuesday day

        // set cooking as monday

      } else if (e === 'nightBeforeTuesday') {
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('MM-DD-YY');
        // set delivery for thursday as tuesday night

        // set cooking as tuesday

      } else if (e === 'dayOfWednesday') {
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');
        // set delivery for thursday as wednesday day

        // set cooking as tuesday

      }
    } // thursday

    if (index === 4) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('MM-DD-YY');

        if (nextDay == 'nightBeforeThursday') {
          daysPaired.push(5);
          // set delivery to friday, saturday and sundays to thursday night

          // summation of friday, saturday and sundays meals

          // set cooking for fri, sat and sun to thursday

        }

      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(5).format('MM-DD-YY');

        if (nextDay == 'dayOfFriday' || nextDay == 'dayOf') {
          daysPaired.push(5);

        }


      } else if (e === 'tuesdayNight') {

        // set delivery for friday as tuesday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('MM-DD-YY');

        // set cooking as tuesday

      } else if (e === 'dayOfWednesday') {
        // set delivery for friday as wednesday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');

        // set cooking as tuesday

      } else if (e === 'nightBeforeWednesday') {
        // set delivery for friday as wednesday night

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('MM-DD-YY');


        // set cooking as wednesday

      } else if (e === 'dayOfThursday') {
        // set delivery for friday as thursday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('MM-DD-YY');

        // set cooking as wednesday
      }
    } // friday

    if (index === 5) {

      if (e === 'nightBeforeThursday' && previousDay !== 'nightBefore') {

        // set delivery for saturday-sunday as thursday night

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('MM-DD-YY');

        // set cooking as thursday

      } else if (e === 'dayOfFriday' && previousDay !== 'dayOf') {
        // set delivery for saturday-sunday as friday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(5).format('MM-DD-YY');

        // set cooking as thursday
      }
    } // saturday-sunday

    if (index === 6) {
      continue;
      daysPaired = [];
    }

    if ((e != '' || e != 'false') && daysPaired.indexOf(index) == -1) {
      deliveries.push(delivery);
      console.log(daysPaired);
    }
  }

  console.log(`Delivery collection data for ${i}`);
  console.log(deliveries);

  console.log(`Delivery selections for${i}`);
  console.log(el.delivery);

}); // aggregate loop

// console.log(subs);

