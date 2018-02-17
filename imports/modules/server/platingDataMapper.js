import Lifestyles from '../../api/Lifestyles/Lifestyles';
import Subscriptions from '../../api/Subscriptions/Subscriptions';
import Restrictions from '../../api/Restrictions/Restrictions';
import Instructions from '../../api/Instructions/Instructions';
import MealPlanner from '../../api/MealPlanner/MealPlanner';
import Plates from '../../api/Plates/Plates';
import Meals from '../../api/Meals/Meals';

import moment from 'moment';


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
  this.dataLabels = [];
  this.platingDate = currentDay;
  // this.platingDay with 0 = sunday & 6 = saturday
  this.platingDay = moment(currentDay).day();

  console.log(this.dataByLifestyle);

  console.log(currentDay);
  console.log(`Plating day${this.platingDay}`);

  this.appendDataToLifestyle = function (scheduleDays, lifestyleIndex) {
    console.log("INSIDE APPEND DATA TO LIFESTYLE")
    console.log(lifestyleIndex)
    console.log(this.dataByLifestyle[lifestyleIndex]);
    console.log('Schedule array');

    scheduleDays.forEach((e) => {
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
  };

  this.gatherLabelData = (customer, schedule, lifestyle) => {

  };

  this.appendDataToCustomers = function (scheduleDays, customer, delivery) {
    console.log("INSIDE APPEND DATA TO CUSTOMERS")

    console.log(customer);
    const lifestyleActual = Lifestyles.findOne({ _id: customer.lifestyle });
    const mealTypes = Meals.find({ title: { $in: ['Breakfast', 'Lunch', 'Dinner'] } }).fetch();

    console.log("MEALS FOR CURRENT DAY " + this.platingDate);
    const mealsPlannedForCurrentDay = MealPlanner.find({ lifestyleId: customer.lifestyle, onDate: this.platingDate }).fetch();

    console.log(mealsPlannedForCurrentDay);

    const customerToAdd = {
      _id: customer._id,
      name: customer.profile.name.first,

      restrictions: null,
      specifcRestrictions: customer.specifcRestrictions,

      lifestyleId: customer.lifestyle,
      lifestyleName: lifestyleActual.title,
      lifestyleRestrictions: null,

      breakfast: 0,
      athleticBreakfast: 0,
      bodybuilderBreakfast: 0,
      breakfastPlate: null,

      lunch: 0,
      athleticLunch: 0,
      bodybuilderLunch: 0,
      lunchPlate: null,

      dinner: 0,
      athleticDinner: 0,
      bodybuilderDinner: 0,
      dinnerPlate: null,

      schedule: customer.schedule,
      delivery,
      scheduleDays,
    };

    scheduleDays.forEach((e) => {

      if (e.breakfast.active) {
        if (e.breakfast.portions === 'athletic') {
          customerToAdd.breakfast += parseInt(e.breakfast.quantity, 10);
        } else if (e.breakfast.portions === 'bodybuilder') {
          customerToAdd.bodybuilderBreakfast += parseInt(e.breakfast.quantity, 10);
        } else {
          customerToAdd.breakfast += parseInt(e.breakfast.quantity, 10);
        }
      }

      if (e.lunch.active) {
        if (e.lunch.portions === 'athletic') {
          customerToAdd.athleticLunch += parseInt(e.lunch.quantity, 10);
        } else if (e.lunch.portions === 'bodybuilder') {
          customerToAdd.bodybuilderLunch += parseInt(e.lunch.quantity, 10);
        } else {
          customerToAdd.lunch += parseInt(e.lunch.quantity, 10);
        }
      }

      if (e.dinner.active) {
        if (e.dinner.portions === 'athletic') {
          customerToAdd.athleticDinner += parseInt(e.dinner.quantity, 10);
        } else if (e.dinner.portions === 'bodybuilder') {
          customerToAdd.bodybuilderDinner += parseInt(e.dinner.quantity, 10);
        } else {
          customerToAdd.dinner += parseInt(e.dinner.quantity, 10);
        }
      }
    });

    if (customer.restrictions.length > 0) {
      customerToAdd.restrictions = Restrictions.find({ _id: { $in: customer.restrictions } }, { fields: { _id: 1, title: 1, type: 1 } }).fetch();
    }

    if (lifestyleActual.restrictions.length > 0) {
      customerToAdd.lifestyleRestrictions = Restrictions.find({ _id: { $in: lifestyleActual.restrictions } }, { fields: { _id: 1, title: 1, type: 1 } }).fetch();
    }


    // if (customerToAdd.breakfast > 0 || customerToAdd.athleticBreakfast > 0 || customerToAdd.bodybuilderBreakfast > 0) {
    //   const breakfastType = mealTypes.find(el => el.title === "Breakfast");
    //   console.log("Breakfast Type")
    //   console.log(breakfastType);

    //   const breakfastMeals = mealsPlannedForCurrentDay.find(el => el.mealId === breakfastType._id);
    //   console.log("Breakfast Meals")
    //   console.log(breakfastMeals);

    //   customerToAdd.breakfastPlate = Plates.aggregate([
    //     {
    //       $match: { _id: breakfastMeals.plateId, }
    //     },
    //     {
    //       $lookup: { from: 'Instructions', localField: 'instructionId', foreignField: '_id', as: 'instruction' }
    //     },
    //     {
    //       $project: { title: 1, subtitle: 1, mealType: 1, ingredients: 1, instructionId: 1, nutritional: 1, instruction: 1 }
    //     }
    //   ]);
    // }

    // if (customerToAdd.lunch > 0 || customerToAdd.athleticLunch > 0 || customerToAdd.bodybuilderLunch > 0) {
    //   const lunchType = mealTypes.find(el => el.title === "Lunch");

    //   const lunchMeals = mealsPlannedForCurrentDay.find(el => el.mealId === lunchType._id);

    //   customerToAdd.lunchPlate = Plates.aggregate([
    //     {
    //       $match: { _id: lunchMeals.plateId, }
    //     },
    //     {
    //       $lookup: { from: 'Instructions', localField: 'instructionId', foreignField: '_id', as: 'instruction' }
    //     },
    //     {
    //       $project: { title: 1, subtitle: 1, mealType: 1, ingredients: 1, instructionId: 1, nutritional: 1, instruction: 1 }
    //     }
    //   ]);
    // }

    // if (customerToAdd.dinner > 0 || customerToAdd.athleticDinner > 0 || customerToAdd.bodybuilderDinner > 0) {
    //   const dinnerType = mealTypes.find(el => el.title === "Dinner");

    //   const dinnerMeals = mealsPlannedForCurrentDay.find(el => el.mealId === dinnerType._id);

    //   customerToAdd.dinnerPlate = Plates.aggregate([
    //     {
    //       $match: { _id: dinnerhMeals.plateId, }
    //     },
    //     {
    //       $lookup: { from: 'Instructions', localField: 'instructionId', foreignField: '_id', as: 'instruction' }
    //     },
    //     {
    //       $project: { title: 1, subtitle: 1, mealType: 1, ingredients: 1, instructionId: 1, nutritional: 1, instruction: 1 }
    //     }
    //   ]);
    // }



    this.dataByCustomer.push(customerToAdd);
  };

  for (let i = 0; i < aggregatedSubs.length; i++) {
    const subscription = aggregatedSubs[i];
    const delivery = subscription.delivery;

    subscription.customers.forEach((customer) => {
      console.log('Customer from sub');
      console.log(customer);
      const customerId = customer._id;
      const customerSchedule = customer.schedule;
      const customerLifestyleId = customer.lifestyle;
      const lifestyleIndex = this.dataByLifestyle.findIndex(e => e.id === customerLifestyleId);
      console.log("Lifestyle Index" + lifestyleIndex)

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
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[1], customerSchedule[2]], customer, delivery);
              }
              // set cooking as sunday
            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for monday and wednesday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[2]], customer, delivery);
              }

              // set cooking as sunday
            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for monday and tuesday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[1]], customer, delivery);
              }
              // set cooking as sunday
            } else {
              // set delivery for monday as sunday night
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0]], customer, delivery);

              }
              // set cooking as sunday
            }
          } else if (e === 'dayOf') {
            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[1], customerSchedule[2]], customer, delivery);

              }
              // set cooking for sunday
            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
              // set delivery for monday and wednesday as monday day

              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[2]], customer, delivery);

              }
              // summation of monday and wednesday meals
              // set cooking for sunday
            } else if (nextDay === 'dayOfPaired') {
              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0], customerSchedule[1]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0], customerSchedule[1]], customer, delivery);

              }
              // set cooking as sunday
            } else {
              // set delivery for monday as monday day

              if (this.platingDay == 0) {
                this.appendDataToLifestyle([customerSchedule[0]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[0]], customer, delivery);

              }
              // sumation of monday meals
              // set cooking as sunday
            }
          }
        } // monday

        if (index === 1) {
          if (e === 'nightBefore') {
            if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
              if (this.platingDay == 1) {

                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[2], customerSchedule[3]], customer, delivery);

              }
              // set cooking as monday
            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for tuesday and thursday as monday night
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[3]], customer, delivery);

              }
              // summation of tuesday and thursday mealss
              // set cooking as monday
            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for tuesday and wednesday as monday night
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[2]], customer, delivery);

              }
              // summation of tuesday and wednesday meals
              // set cooking as monday
            } else {
              // set delivery for tuesday as monday night
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1]], customer, delivery);

              }
              // summation of tuesday meals
              // set cooking as monday
            }
          } else if (e === 'dayOf') {
            // set delivery as tuesday day

            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[2], customerSchedule[3]], customer, delivery);
              }
              // set cooking as monday
            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[3]], customer, delivery);

              }
              // set cooking as monday
            } else if (nextDay === 'dayOfPaired') {
              // set delivery for tuesday and wednesday as tuesday day
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1], customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1], customerSchedule[2]], customer, delivery);

              }
              // summation of tuesday and wednesday meals
              // set cooking as monday
            } else {
              // set delivery for tuesday as tuesday day
              if (this.platingDay == 1) {
                this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[1]], customer, delivery);

              }
              // set cooking as monday
            }
          } else if (e === 'sundayNight') {
            // set delivery for tuesday as sunday night
            if (this.platingDay == 0) {
              this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[1]], customer, delivery);

            }
            // set cooking as sunday
          } else if (e === 'dayOfMonday') {
            // set delivery for tuesday as monday day
            if (this.platingDay == 0) {
              this.appendDataToLifestyle([customerSchedule[1]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[1]], customer, delivery);

            }
            // set cooking as sunday
          }
        } // tuesday

        if (index === 2) {
          if (e === 'nightBefore') {
            if (nextDay === 'nightBeforePaired' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for wednesday, thursday and friday as tuesday night
              // summation of wednesday thursday and friday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[3], customerSchedule[4]], customer, delivery);

              }
              // set cooking as tuesday
            } else if (nextDay === '' && dayAfterTomorrow === 'nightBeforePaired') {
              // set delivery for wednesday and friday as tuesday night
              // summation of wednesday and friday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[4]], customer, delivery);

              }

              // set cooking as tuesday
            } else if (nextDay === 'nightBeforePaired') {
              // set delivery for wednesday and thursday as tuesday night
              // summation of wednesday and thursay meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[3]], customer, delivery);

              }
              // set cooking as tuesday
            } else {
              // set delivery for wendesday as tuesday night
              // summation of wednesday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2]], customer, delivery);

              }
              // set cooking as tuesday
            }
          } else if (e === 'dayOf') {
            if (nextDay === 'dayOfPaired' && dayAfterTomorrow === 'dayOfPaired') {
              // set delivery for wednesday, thursday and friday as wednesday day
              // summation of wednesday thursday and friday meals
              // set cooking as tuesday
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[3], customerSchedule[4]], customer, delivery);
              }
            } else if (nextDay === '' && dayAfterTomorrow === 'dayOfPaired') {
              // set delivery for wednesday and friday as wednesday day
              // summation of wednesday and friday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[4]], customer, delivery);
              }
              // set cooking as tuesday
            } else if (nextDay === 'dayOfPaired') {
              // set delivery for wednesday and thursday as wednesday day
              // summation of wednesday and thursday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2], customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2], customerSchedule[3]], customer, delivery);

              }
              // set cooking as tuesday
            } else {
              // set delivery for wednesday as wednesday day
              // summation of wednesday meals
              if (this.platingDay == 2) {
                this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[2]], customer, delivery);

              }
              // set cooking as tuesday
            }
          } else if (e === 'sundayNight') {
            // set delivery for wednesday as sunday night
            // summation of wednesday meals
            if (this.platingDay == 0) {
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[2]], customer, delivery);
            }
            // set cooking as sunday
          } else if (e === 'dayOfMonday') {
            // set delivery for wednesday as monday day
            // summation of wednesday meals
            if (this.platingDay == 0) {
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[2]], customer, delivery);

            }
            // set cooking as sunday
          } else if (e === 'nightBeforeMonday') {
            // set delivery for wednesday as monday night
            // summation of wednesday meals
            if (this.platingDay == 1) {
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[2]], customer, delivery);
            }
            // set cooking as monday
          } else if (e === 'dayOfTuesday') {
            // set delivery for wednesday as tuesday day
            // summation of wednesday meals
            if (this.platingDay == 1) {
              this.appendDataToLifestyle([customerSchedule[2]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[2]], customer, delivery);

            }
            // set cooking as monday
          }
        } // wednesday

        if (index === 3) {
          if (e === 'nightBefore') {
            if (nextDay === 'nightBeforePaired') {
              // set delivery for thursday and friday as wednesday night
              // summation
              // set cooking as wednesday
              if (this.platingDay == 3) {
                this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);

              }
            } else {
              // set delivery for thursday as wednesday night
              // summation
              if (this.platingDay == 3) {
                this.appendDataToLifestyle([customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[3]], customer, delivery);
              }
              // set cooking as wednesday
            }
          } else if (e === 'dayOf') {
            if (nextDay === 'dayOfPaired') {
              // set delivery for thursday and friday as thursday day
              if (this.platingDay == 3) {
                this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);
              }
              // set cooking as wednesday
            } else {
              // set delivery for thursday as thursday day
              if (this.platingDay == 3) {
                this.appendDataToLifestyle([customerSchedule[3]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[3]], customer, delivery);
              }
              // set cooking as wednesday
            }
          } else if (e === 'mondayNight') {
            // set delivery for thursday as monday night

            if (this.platingDay == 1) {
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);
            }
            // set cooking as monday
          } else if (e === 'dayOfTuesday') {
            // set delivery for thursday as tuesday day
            if (this.platingDay == 1) {
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);
            }
            // set cooking as monday
          } else if (e === 'nightBeforeTuesday') {
            // set delivery for thursday as tuesday night
            if (this.platingDay == 2) {
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);
            }

            // set cooking as tuesday
          } else if (e === 'dayOfWednesday') {
            // set delivery for thursday as wednesday day

            if (this.platingDay == 2) {
              this.appendDataToLifestyle([customerSchedule[3], customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[3], customerSchedule[4]], customer, delivery);
            }

            // set cooking as tuesday
          }
        } // thursday

        if (index === 4) {
          if (e === 'nightBefore') {
            if (nextDay == 'nightBeforeThursday') {
              // set delivery to friday, saturday and sundays to thursday night
              // summation of friday, saturday and sundays meals
              // set cooking for fri, sat and sun to thursday

              if (this.platingDay == 4) {
                this.appendDataToLifestyle([customerSchedule[4], customerSchedule[5], customerSchedule[6]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[4], customerSchedule[5], customerSchedule[6]], customer, delivery);

              }
            } else if (this.platingDay == 4) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);

            }
          } else if (e === 'dayOf') {
            if (nextDay == 'dayOfFriday' || nextDay == 'dayOf') {
              if (this.platingDay == 4) {
                this.appendDataToLifestyle([customerSchedule[4], customerSchedule[5], customerSchedule[6]], lifestyleIndex);
                this.appendDataToCustomers([customerSchedule[4], customerSchedule[5], customerSchedule[6]], customer, delivery);

              }
            } else if (this.platingDay == 4) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);
            }
          } else if (e === 'tuesdayNight') {
            // set delivery for friday as tuesday night
            if (this.platingDay == 2) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);
            }
            // set cooking as tuesday
          } else if (e === 'dayOfWednesday') {
            // set delivery for friday as wednesday day

            if (this.platingDay == 2) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);
            }
            // set cooking as tuesday
          } else if (e === 'nightBeforeWednesday') {
            // set delivery for friday as wednesday night
            if (this.platingDay == 3) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);
            }
            // set cooking as wednesday
          } else if (e === 'dayOfThursday') {
            // set delivery for friday as thursday day

            if (this.platingDay == 3) {
              this.appendDataToLifestyle([customerSchedule[4]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[4]], customer, delivery);
            }
            // set cooking as wednesday
          }
        } // friday

        if (index === 5) {
          if (e === 'nightBeforeThursday') {
            // set delivery for saturday-sunday as thursday night

            if (this.platingDay == 4) {
              this.appendDataToLifestyle([customerSchedule[5], customerSchedule[6]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[5], customerSchedule[6]], customer, delivery);
            }
            // set cooking as thursday
          } else if (e === 'dayOfFriday') {
            // set delivery for saturday-sunday as friday day

            if (this.platingDay == 4) {
              this.appendDataToLifestyle([customerSchedule[5], customerSchedule[6]], lifestyleIndex);
              this.appendDataToCustomers([customerSchedule[5], customerSchedule[6]], customer, delivery);
            }

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
