// import { Email } from 'meteor/email';
import moment from 'moment';

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
import Deliveries from '../../api/Deliveries/Deliveries';
import sendDeliveredEmail from '../../api/Deliveries/server/send-delivered-email';


// Email.send({
//   from: 'mailgun@sandboxf5538b27bf3f458ea825bc8f3cbe365e.mailgun.org',
//   to: 'jivanyesh@gmail.com',
//   subject: 'Test',
//   text: 'This is a test',
// });


const job = new Job(Jobs, 'createInvoices', {});

const createInvoicesExists = Jobs.findOne({ type: 'createInvoices' });

// console.log(createInvoicesExists);


// sendDeliveredEmail({
//   firstName: 'Jivanysh',
//   email: 'jivanyesh@gmail.com',
//   totalMeals: '2 meals',
//   address: 'ABC1, ABC2',
//   deliveredAt: '10:30 AM'
// })

if (!createInvoicesExists) {
  job
    .priority('normal')
    .repeat({
      schedule: Jobs.later.parse.cron('0 8 * * 6'),
    })
    .save();
} // Commit it to the server


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

// console.log(aggregation);


function addMealsForTheDay(day) {
  let sum = 0;

  if (day.breakfast.active) {
    sum += parseInt(day.breakfast.quantity, 10);
  }

  if (day.lunch.active) {
    sum += parseInt(day.lunch.quantity, 10);
  }

  if (day.dinner.active) {
    sum += parseInt(day.dinner.quantity, 10);
  }

  return sum;
}

aggregation.forEach((el, i) => {

  // console.log('Current subscription');

  // console.log(el);

  // take out route id, subscription id, customer id,

  // take out each secondary profile from the customers secondary accounts that were aggregated

  // loop through delivery details on subscription
  // in the loop create documents for delivery and cooking

  // console.log(`customer for ${i}`);
  // console.log(el.customer[0]);

  const customer = el.customer[0];
  const primaryCustomerName = customer.profile.name ? `${customer.profile.name.first} ${customer.profile.name.last ? customer.profile.name.last : ''}` : '';
  const primarySchedule = customer.schedule;

  const containsSecondaries = el.customer[0].associatedProfiles > 0;
  const secondaryAccounts = containsSecondaries ? el.secondaryProfiles : null;

  const secondarySchedules = containsSecondaries ? secondaryAccounts.map(e => e.schedule) : null;
  const secondaryCustomerNames = containsSecondaries ? secondaryAccounts.map(e => (e.profile.name ? `${e.profile.name.first} ${e.profile.name.last ? e.profile.name.last : ''}` : '')) : null;

  console.log(`Customer ${i}`);
  console.log(customer._id);
  console.log('Schedule');
  console.log(primarySchedule);
  console.log('Secondary accounts');
  console.log(secondaryCustomerNames);

  console.log('Secondary schedules');
  console.log(secondarySchedules);

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
      postalCode: el.postalCode[0]._id,
      routeId: el.route[0]._id,
      title: '',
      status: 'Scheduled',
      meals: [],
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
          delivery.onDate = moment().isoWeekday(7).format('YYYY-MM-DD');


          // meal summation
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday


        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {

          daysPaired.push(2);

          // set delivery for monday and wednesday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().add(1, 'weeks').isoWeekday(1);

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday


        } else if (nextDay === 'nightBeforePaired') {

          daysPaired.push(1);

          // set delivery for monday and tuesday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().isoWeekday(7).format('YYYY-MM-DD');

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday

        } else {

          // set delivery for monday as sunday night
          delivery.title = 'nightBefore';
          delivery.onDate = moment().isoWeekday(7).format('YYYY-MM-DD');

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD');

        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(1);
          daysPaired.push(2);

          // set delivery for monday tuesday and wednesday as monday day

          // summation of monday tuesday and wednesday meals

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });


          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking for sunday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(2);
          // set delivery for monday and wednesday as monday day


          // summation of monday and wednesday meals

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking for sunday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(1);
          // set delivery for monday tuesday as monday day

          // summation of monday and and tuesday meals

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday

        } else {
          // set delivery for monday as monday day


          // sumation of monday meals

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as sunday

        }
      }

    } // monday

    if (index === 1) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD');

        if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(2);
          daysPaired.push(3);
          // set delivery for tuesday, wednesday and thursday as monday night

          // summation of tuesday, wednesday and thursday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(3);
          // set delivery for tuesday and thursday as monday night

          // summation of tuesday and thursday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else if (nextDay === 'nightBeforePaired') {
          daysPaired.push(2);
          // set delivery for tuesday and wednesday as monday night

          // summation of tuesday and wednesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else {
          // set delivery for tuesday as monday night

          // summation of tuesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }
          // set cooking as monday

        }
      } else if (e === 'dayOf') {
        // set delivery as tuesday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('YYYY-MM-DD');

        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(2);
          daysPaired.push(3);
          // set delivery for tuesday, wednesday and thursday as tuesday day

          // summation of tuesday wednesday and thursday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(3);

          // set delivery for tuesday and thursday as tuesday day

          // summation of tuesday and thursday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(2);

          // set delivery for tuesday and wednesday as tuesday day

          // summation of tuesday and wednesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as monday

        } else {

          // set delivery for tuesday as tuesday day

          // summation of tuesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),

              });

            });

            console.log(delivery.meals);
          }
          // set cooking as monday

        }
      } else if (e === 'sundayNight') {
        // set delivery for tuesday as sunday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().isoWeekday(7).format('YYYY-MM-DD');

        // summation of tuesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }
        // set cooking as sunday

      } else if (e === 'dayOfMonday') {
        // set delivery for tuesday as monday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD');

        // summation of tuesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as sunday

      }
    } // tuesday

    if (index === 2) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('YYYY-MM-DD');


        if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for wednesday, thursday and friday as tuesday night

          // summation of wednesday thursday and friday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as tuesday

        } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
          daysPaired.push(4);
          // set delivery for wednesday and friday as tuesday night

          // summation of wednesday and friday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as tuesday

        } else if (nextDay === 'nightBeforePaired') {
          daysPaired.push(3);
          // set delivery for wednesday and thursday as tuesday night

          // summation of wednesday and thursay meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }
          // set cooking as tuesday

        } else {
          // set delivery for wendesday as tuesday night

          // summation of wednesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }
          // set cooking as tuesday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');


        if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for wednesday, thursday and friday as wednesday day

          // summation of wednesday thursday and friday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as tuesday

        } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
          daysPaired.push(4);
          // set delivery for wednesday and friday as wednesday day

          // summation of wednesday and friday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }
          // set cooking as tuesday

        } else if (nextDay === 'dayOfPaired') {
          daysPaired.push(3);
          // set delivery for wednesday and thursday as wednesday day

          // summation of wednesday and thursday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as tuesday

        } else {
          // set delivery for wednesday as wednesday day


          // summation of wednesday meals
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as tuesday

        }
      } else if (e === 'sundayNight') {
        // set delivery for wednesday as sunday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().isoWeekday(7).format('YYYY-MM-DD');

        // summation of wednesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as sunday

      } else if (e === 'dayOfMonday') {
        // set delivery for wednesday as monday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD');

        // summation of wednesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as sunday

      } else if (e === 'nightBeforeMonday') {
        // set delivery for wednesday as monday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');

        // summation of wednesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as monday

      } else if (e === 'dayOfTuesday') {
        // set delivery for wednesday as tuesday day
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');

        // summation of wednesday meals
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as monday

      }

    } // wednesday

    if (index === 3) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');

        if (nextDay === 'nightBeforePaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for thursday and friday as wednesday night
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });


          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // summation

          // set cooking as wednesday

        } else {
          // set delivery for thursday as wednesday night

          // summation
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as wednesday

        }
      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('YYYY-MM-DD');

        if (nextDay === 'dayOfPaired') {
          daysPaired.push(3);
          daysPaired.push(4);
          // set delivery for thursday and friday as thursday day
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking as wednesday

        } else {
          // set delivery for thursday as thursday day
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }
          // set cooking as wednesday

        }
      } else if (e === 'mondayNight') {
        // set delivery for thursday as monday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(1).format('YYYY-MM-DD');

        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as monday

      } else if (e === 'dayOfTuesday') {
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('YYYY-MM-DD');
        // set delivery for thursday as tuesday day


        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as monday

      } else if (e === 'nightBeforeTuesday') {
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('YYYY-MM-DD');
        // set delivery for thursday as tuesday night

        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }
        // set cooking as tuesday

      } else if (e === 'dayOfWednesday') {
        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');
        // set delivery for thursday as wednesday day

        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as tuesday

      }
    } // thursday

    if (index === 4) {
      if (e === 'nightBefore') {

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('YYYY-MM-DD');

        if (nextDay == 'nightBeforeThursday') {
          daysPaired.push(5);
          // set delivery to friday, saturday and sundays to thursday night

          // summation of friday, saturday and sundays meals

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });


          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

          // set cooking for fri, sat and sun to thursday

        } else {

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }

        }

      } else if (e === 'dayOf') {

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(5).format('YYYY-MM-DD');

        if (nextDay == 'dayOfFriday' || nextDay == 'dayOf') {
          daysPaired.push(5);

          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]) +
              addMealsForTheDay(primarySchedule[index + 1]) +
              addMealsForTheDay(primarySchedule[index + 2]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]) +
                  addMealsForTheDay(secondarySchedule[index + 1]) +
                  addMealsForTheDay(secondarySchedule[index + 2]),
              });

            });

            console.log(delivery.meals);
          }

        } else {
          delivery.meals.push({
            name: primaryCustomerName,
            total: addMealsForTheDay(primarySchedule[index]),
          });

          if (containsSecondaries) {
            secondarySchedules.forEach((secondarySchedule, profileIndex) => {

              delivery.meals.push({
                name: secondaryCustomerNames[profileIndex],
                total: addMealsForTheDay(secondarySchedule[index]),
              });

            });

            console.log(delivery.meals);
          }
        }


      } else if (e === 'tuesdayNight') {

        // set delivery for friday as tuesday night
        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(2).format('YYYY-MM-DD');
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }
        // set cooking as tuesday

      } else if (e === 'dayOfWednesday') {
        // set delivery for friday as wednesday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }
        // set cooking as tuesday

      } else if (e === 'nightBeforeWednesday') {
        // set delivery for friday as wednesday night

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(3).format('YYYY-MM-DD');
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });


        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }

        // set cooking as wednesday

      } else if (e === 'dayOfThursday') {
        // set delivery for friday as thursday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('YYYY-MM-DD');

        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]),
        });


        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]),
            });

          });

          console.log(delivery.meals);
        }
        // set cooking as wednesday
      }
    } // friday

    if (index === 5) {

      if (e === 'nightBeforeThursday') {

        // set delivery for saturday-sunday as thursday night

        delivery.title = 'nightBefore';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(4).format('YYYY-MM-DD');

        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]) +
            addMealsForTheDay(primarySchedule[index + 1]),
        });


        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]) +
                addMealsForTheDay(secondarySchedule[index + 1]),

            });

          });

          console.log(delivery.meals);
        }

        // set cooking as thursday

      } else if (e === 'dayOfFriday') {
        // set delivery for saturday-sunday as friday day

        delivery.title = 'dayOf';
        delivery.onDate = moment().add(1, 'weeks').isoWeekday(5).format('YYYY-MM-DD');
        delivery.meals.push({
          name: primaryCustomerName,
          total: addMealsForTheDay(primarySchedule[index]) +
            addMealsForTheDay(primarySchedule[index + 1]),

        });

        if (containsSecondaries) {
          secondarySchedules.forEach((secondarySchedule, profileIndex) => {

            delivery.meals.push({
              name: secondaryCustomerNames[profileIndex],
              total: addMealsForTheDay(secondarySchedule[index]) +
                addMealsForTheDay(secondarySchedule[index + 1]),

            });

          });

          console.log(delivery.meals);
        }
        // set cooking as thursday
      }
    } // saturday-sunday

    if (index === 6) {
      continue;
      daysPaired = [];
    }

    // if a day is not paired and not empty only then push the document into deliveries array

    if ((e != '' || e != 'false') && daysPaired.indexOf(index) == -1) {
      console.log('Pushing this delivery');
      deliveries.push(delivery);

      console.log('Meals inside this delivery');
      console.log(delivery.meals);

    }

  }


  console.log('Delivery collection data');
  console.log(deliveries);

  deliveries.forEach((e, i) => {
    console.log(`Delivery ${i}`);
    console.log(e.meals);
  });

  // if (deliveries.length > 0) {

  //   deliveries.forEach((deliveryIn, indexForDelivery) => {
  //     Deliveries.insert(deliveryIn);
  //   });
  // }

  console.log('Delivery selections');
  console.log(el.delivery);
  console.log('Delivery meals actual');

}); // aggregate loop

