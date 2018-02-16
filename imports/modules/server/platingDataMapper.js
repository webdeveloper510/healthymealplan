import Lifestyles from '../../api/Lifestyles/Lifestyles';
import Subscriptions from '../../api/Subscriptions/Subscriptions';
import Restrictions from '../../api/Restrictions/Restrictions';
import MealPlanner from '../../api/MealPlanner/MealPlanner';
import moment from 'moment';

// const customer = {
//   _id: '',
//   lifestyleId: '',
//   name: 'first name + last name',
//   restrictions: [],
//   specifcRestrictions: 0,
//   breakfast: 0,
//   athleticBreakfast: 0,
//   lunch: 0,
//   athleticLunch: 0,
//   dinner: 0,
//   athleticDinner: 0,
// };


/**
 * Iterates all the lifestyles and fills up the array with objects for table values for each of the meal types.
 *
 */
function setUpLifestyles() {
  const dataByLifestyle = [];

  const lifestyles = Lifestyles.find().fetch();

  lifestyles.forEach((e) => {
    dataByLifestyle.push({
      id: e._id,
      breakfast: {
        regular: 0,
        athletic: 0,
        bodybuilder: 0,
      },
      lunch: {
        regular: 0,
        athletic: 0,
        bodybuilder: 0,
      },
      dinner: {
        regular: 0,
        athletic: 0,
        bodybuilder: 0,
      },
    });
  });

  return dataByLifestyle;
}
/**
 *
 * @param {SubscriptionsAggregation} aggregatedSubs
 * @param {Moment Date} currentDay
 */
export default function platingDataMapper(aggregatedSubs, currentDay) {
  const allSubs = [];
  this.dataByLifestyle = setUpLifestyles();
  this.dataByCustomer = [];
  this.platingDay = moment(currentDay).day();

  console.log(currentDay);
  console.log("Plating day" + this.platingDay);

  this.appendDataToLifestyle = function (scheduleDays, lifestyleIndex) {
    console.log("Schedule array");

    scheduleDays.forEach(e => {

      console.log(e);

      if (e.breakfast.active) {
        this.dataByLifestyle[lifestyleIndex].breakfast[e.breakfast.portions] += parseInt(e.breakfast.quantity, 10);
      }

      if (e.lunch.active) {
        this.dataByLifestyle[lifestyleIndex].lunch[e.lunch.portions] += parseInt(e.lunch.quantity, 10);
      }

      if (e.dinner.active) {
        this.dataByLifestyle[lifestyleIndex].dinner[e.dinner.portions] += parseInt(e.dinner.quantity, 10);
      }

    });
  }

  // this.platingDay with 0 = sunday & 6 = saturday



  for (let i = 0; i < aggregatedSubs.length; i++) {
    const subscription = aggregatedSubs[i];
    const delivery = subscription.delivery;
    // console.log(this.dataByLifestyle)

    // console.log(`Subscription ${i} with _id ${subscription._id}`);
    // console.log('Delivery');
    // console.log(subscription.delivery);

    subscription.customers.forEach((customer) => {
      // console.log(customer);
      const customerSchedule = customer.schedule;
      const customerLifestyleId = customer.lifestyle;
      const lifestyleIndex = this.dataByLifestyle.findIndex(e => e.id === customerLifestyleId);

      for (let index = 0; index < delivery.length; index++) {
        const e = delivery[index];
        const previousDay = delivery[index - 1];
        const dayBeforeYesterday = delivery[index - 2];
        const nextDay = index < 6 ? delivery[index + 1] : null;
        const dayAfterTomorrow = index < 5 ? delivery[index + 2] : null;

        if (e === 'false' || e === '') {
          continue;
        }

        if (index === 0) {
          if (e === 'nightBefore') {
            if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for monday tuesday and wednesday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1], customerSchedule[2]], lifestyleIndex)
              }
              // set cooking as sunday
            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for monday and wednesday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[2]], lifestyleIndex)
              }

              // set cooking as sunday
            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for monday and tuesday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1]], lifestyleIndex)
              }
              // set cooking as sunday
            } else {
              // set delivery for monday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0]], lifestyleIndex)
              }
              // set cooking as sunday
            }
          } else if (e === 'dayOf') {
            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {

              if (this.platingDay == 0)
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1], customerSchedule[2]], lifestyleIndex)
              // set cooking for sunday

            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
              // set delivery for monday and wednesday as monday day

              if (this.platingDay == 0)
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[2]], lifestyleIndex)
              // summation of monday and wednesday meals
              // set cooking for sunday

            } else if (nextDay === 'dayOfPaired') {

              if (this.platingDay == 0)
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1]], lifestyleIndex)
              // set cooking as sunday
            } else {
              // set delivery for monday as monday day

              if (this.platingDay == 0)
                this.appendDataToLifestyle([customerSchedule[0]], lifestyleIndex)
              // sumation of monday meals
              // set cooking as sunday
            }
          }
        } // monday

        if (index === 1) {
          if (e === 'nightBefore') {

            if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {

              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2], customerSchedule[3]], lifestyleIndex)
              // set cooking as monday

            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for tuesday and thursday as monday night
              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[3]], lifestyleIndex)
              // summation of tuesday and thursday mealss
              // set cooking as monday

            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for tuesday and wednesday as monday night
              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2]], lifestyleIndex)
              // summation of tuesday and wednesday meals
              // set cooking as monday

            } else {
              // set delivery for tuesday as monday night
              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex)
              // summation of tuesday meals
              // set cooking as monday

            }
          } else if (e === 'dayOf') {
            // set delivery as tuesday day

            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {

              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2], customerSchedule[3]], lifestyleIndex)
              // set cooking as monday

            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {

              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[3]], lifestyleIndex)
              // set cooking as monday

            } else if (nextDay === 'dayOfPaired') {

              // set delivery for tuesday and wednesday as tuesday day
              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2]], lifestyleIndex)
              // summation of tuesday and wednesday meals
              // set cooking as monday

            } else {
              // set delivery for tuesday as tuesday day
              if (this.platingDay == 1)
                this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex)
              // set cooking as monday
            }
          } else if (e === 'sundayNight') {
            // set delivery for tuesday as sunday night
            if (this.platingDay == 0)
              this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex)
            // set cooking as sunday

          } else if (e === 'dayOfMonday') {
            // set delivery for tuesday as monday day
            if (this.platingDay == 0)
              this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex)
            // set cooking as sunday

          }
        } // tuesday

        if (index === 2) {
          if (e === 'nightBefore') {

            if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {

              // set delivery for wednesday, thursday and friday as tuesday night
              // summation of wednesday thursday and friday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3], customerSchedule[4]], lifestyleIndex)
              // set cooking as tuesday

            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for wednesday and friday as tuesday night
              // summation of wednesday and friday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[4]], lifestyleIndex)

              // set cooking as tuesday

            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for wednesday and thursday as tuesday night
              // summation of wednesday and thursay meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3]], lifestyleIndex)
              // set cooking as tuesday

            } else {
              // set delivery for wendesday as tuesday night
              // summation of wednesday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
              // set cooking as tuesday

            }
          } else if (e === 'dayOf') {

            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {

              // set delivery for wednesday, thursday and friday as wednesday day
              // summation of wednesday thursday and friday meals
              // set cooking as tuesday
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3], customerSchedule[4]], lifestyleIndex)

            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
              // set delivery for wednesday and friday as wednesday day
              // summation of wednesday and friday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[4]], lifestyleIndex)
              // set cooking as tuesday

            } else if (nextDay === 'dayOfPaired') {
              // set delivery for wednesday and thursday as wednesday day
              // summation of wednesday and thursday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3]], lifestyleIndex)
              // set cooking as tuesday

            } else {
              // set delivery for wednesday as wednesday day
              // summation of wednesday meals
              if (this.platingDay == 2)
                this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
              // set cooking as tuesday

            }
          } else if (e === 'sundayNight') {
            // set delivery for wednesday as sunday night
            // summation of wednesday meals
            if (this.platingDay == 0)
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
            // set cooking as sunday

          } else if (e === 'dayOfMonday') {
            // set delivery for wednesday as monday day
            // summation of wednesday meals
            if (this.platingDay == 0)
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
            // set cooking as sunday

          } else if (e === 'nightBeforeMonday') {
            // set delivery for wednesday as monday night
            // summation of wednesday meals
            if (this.platingDay == 1)
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
            // set cooking as monday

          } else if (e === 'dayOfTuesday') {
            // set delivery for wednesday as tuesday day
            // summation of wednesday meals
            if (this.platingDay == 1)
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex)
            // set cooking as monday

          }

        } // wednesday

        if (index === 3) {
          if (e === 'nightBefore') {

            if (nextDay === 'nightBeforePaired') {

              // set delivery for thursday and friday as wednesday night
              // summation
              // set cooking as wednesday
              if (this.platingDay == 3)
                this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)

            } else {
              // set delivery for thursday as wednesday night
              // summation
              if (this.platingDay == 3)
                this.appendDataToLifestyle([customerSchedule[3]], lifestyleIndex)
              // set cooking as wednesday

            }
          } else if (e === 'dayOf') {


            if (nextDay === 'dayOfPaired') {

              // set delivery for thursday and friday as thursday day
              if (this.platingDay == 3)
                this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)
              // set cooking as wednesday

            } else {
              // set delivery for thursday as thursday day
              if (this.platingDay == 3)
                this.appendDataToLifestyle([customerSchedule[3]], lifestyleIndex)
              // set cooking as wednesday

            }
          } else if (e === 'mondayNight') {
            // set delivery for thursday as monday night

            if (this.platingDay == 1)
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)
            // set cooking as monday

          } else if (e === 'dayOfTuesday') {

            // set delivery for thursday as tuesday day
            if (this.platingDay == 1)
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)
            // set cooking as monday

          } else if (e === 'nightBeforeTuesday') {

            // set delivery for thursday as tuesday night
            if (this.platingDay == 2)
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)

            // set cooking as tuesday

          } else if (e === 'dayOfWednesday') {

            // set delivery for thursday as wednesday day

            if (this.platingDay == 2)
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex)

            // set cooking as tuesday

          }
        }   //thursday 

        if (index === 4) {
          if (e === 'nightBefore') {

            if (nextDay == 'nightBeforeThursday') {
              // set delivery to friday, saturday and sundays to thursday night
              // summation of friday, saturday and sundays meals
              // set cooking for fri, sat and sun to thursday

              if (this.platingDay == 4)
                this.appendDataToLifestyle([customerSchedule[4], customerSchedule[5], customerSchedule[6]], lifestyleIndex)

            } else {

              if (this.platingDay == 4)
                this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            }

          } else if (e === 'dayOf') {

            if (nextDay == 'dayOfFriday' || nextDay == 'dayOf') {

              if (this.platingDay == 4)
                this.appendDataToLifestyle([customerSchedule[4], customerSchedule[5], customerSchedule[6]], lifestyleIndex)

            } else {
              if (this.platingDay == 4)
                this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            }


          } else if (e === 'tuesdayNight') {

            // set delivery for friday as tuesday night
            if (this.platingDay == 2)
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            // set cooking as tuesday

          } else if (e === 'dayOfWednesday') {
            // set delivery for friday as wednesday day

            if (this.platingDay == 2)
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            // set cooking as tuesday

          } else if (e === 'nightBeforeWednesday') {
            // set delivery for friday as wednesday night
            if (this.platingDay == 3)
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            // set cooking as wednesday

          } else if (e === 'dayOfThursday') {
            // set delivery for friday as thursday day

            if (this.platingDay == 3)
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex)
            // set cooking as wednesday
          }
        } // friday

        if (index === 5) {

          if (e === 'nightBeforeThursday') {

            // set delivery for saturday-sunday as thursday night

            if (this.platingDay == 4)
              this.appendDataToLifestyle([customerSchedule[5], customerSchedule[6]], lifestyleIndex)
            // set cooking as thursday

          } else if (e === 'dayOfFriday') {
            // set delivery for saturday-sunday as friday day

            if (this.platingDay == 4)
              this.appendDataToLifestyle([customerSchedule[5], customerSchedule[6]], lifestyleIndex)

            // set cooking as thursday
          }
        } // saturday-sunday


      } // for delivery
    }); // for each customers
  }
  // aggregated subs

  console.log(this.dataByLifestyle);

  return {
    tableData: this.dataByLifestyle,
    userData: this.dataByCustomer,
  };
}
