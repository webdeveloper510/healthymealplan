import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Ingredients from '../../../api/Ingredients/Ingredients';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Discounts from '../../../api/Discounts/Discounts';

import createSubscriptionLineItems from './createSubscriptionLineItems';

import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';

export default function calculateSubscriptionCost(customerInfo) {
  const sub = Subscriptions.findOne({ customerId: customerInfo.id });

  const primaryCustomer = {
    lifestyle: '',
    breakfastPrice: 0,
    lunchPrice: 0,
    dinnerPrice: 0,
    breakfast: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    lunch: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    dinner: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    // coolerBag: customerInfo.coolerBag ? 20 : 0,
    coolerBag: 0,
    deliveryCost: 0,

    discount: customerInfo.discount,
    discountActual: 0,

    discountCodeApplies: false,
    dicsountCodeAmount: 0,

    restrictions: customerInfo.restrictions,
    restrictionsActual: [],
    restrictionsSurcharges: [],
    specificRestrictions: customerInfo.specificRestrictions,
    specificRestrictionsActual: [],
    specificRestrictionsSurcharges: [],
    preferences: customerInfo.subIngredients,

    totalAthleticSurcharge: 0,
    totalBodybuilderSurcharge: 0,
    deliverySurcharges: 0,
  };

  const secondaryCustomers = [];

  let discountCodePresent = false;
  let discountCodeApplied = null;

  if (sub.hasOwnProperty('discountApplied') || customerInfo.hasOwnProperty('discountCode')) {
    discountCodePresent = true;
  }

  if (discountCodePresent) {
    if (sub.hasOwnProperty('discountApplied')) {
      discountCodeApplied = Discounts.findOne({ _id: sub.discountApplied });
    }

    if (customerInfo.discountCode != '') {
      discountCodeApplied = Discounts.findOne({ $or: [{ title: customerInfo.discountCode }, { _id: customerInfo.discountCode }] });
    }

    primaryCustomer.discountCodeApplied = discountCodeApplied;
  }

  // console.log('Yes');
  // console.log(primaryCustomer.discountCodeApplied);

  primaryCustomer.lifestyle = Lifestyles.findOne({ _id: customerInfo.lifestyle });
  // calculating basePrices for Breakfast, lunch and dinner

  let metCriteria = 0;
  const customerScheduleTotals = [];
  const secondaryCustomerTotals = [];

  // calculating total quantities and extra quantities and regular quantites
  customerInfo.scheduleReal.forEach((e, i) => {
    let thisDaysQty = 0;

    if (e.breakfast.active) {
      primaryCustomer.breakfast.totalQty =
        primaryCustomer.breakfast.totalQty +
        parseInt(e.breakfast.quantity, 10);

      if (e.breakfast.portions == 'regular') {
        primaryCustomer.breakfast.regularQty += parseInt(
          e.breakfast.quantity,
          10,
        );
      } else if (e.breakfast.portions == 'athletic') {
        primaryCustomer.breakfast.athleticQty += parseInt(
          e.breakfast.quantity,
          10,
        );
      } else if ((e.breakfast.portions = 'bodybuilder')) {
        primaryCustomer.breakfast.bodybuilderQty += parseInt(
          e.breakfast.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.breakfast.quantity, 10);
    }

    if (e.lunch.active) {
      primaryCustomer.lunch.totalQty =
        primaryCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

      if (e.lunch.portions == 'regular') {
        primaryCustomer.lunch.regularQty += parseInt(e.lunch.quantity, 10);
      } else if (e.lunch.portions == 'athletic') {
        primaryCustomer.lunch.athleticQty += parseInt(e.lunch.quantity, 10);
      } else if ((e.lunch.portions = 'bodybuilder')) {
        primaryCustomer.lunch.bodybuilderQty += parseInt(
          e.lunch.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.lunch.quantity, 10);
    }

    if (e.dinner.active) {
      primaryCustomer.dinner.totalQty =
        primaryCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

      if (e.dinner.portions == 'regular') {
        primaryCustomer.dinner.regularQty += parseInt(e.dinner.quantity, 10);
      } else if (e.dinner.portions == 'athletic') {
        primaryCustomer.dinner.athleticQty += parseInt(e.dinner.quantity, 10);
      } else if ((e.dinner.portions = 'bodybuilder')) {
        primaryCustomer.dinner.bodybuilderQty += parseInt(
          e.dinner.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.dinner.quantity, 10);
    }

    customerScheduleTotals.push(thisDaysQty);
  });

  // console.log(customerScheduleTotals);

  if (
    customerScheduleTotals[0] >= 2 &&
    customerScheduleTotals[1] >= 2 &&
    customerScheduleTotals[2] >= 2 &&
    customerScheduleTotals[3] >= 2 &&
    customerScheduleTotals[4] >= 2
  ) {
    metCriteria += 1;
  }

  // console.log('met criteria after primary customer');
  // console.log(metCriteria);

  if (customerInfo.secondaryProfiles.length > 0) {
    customerInfo.secondaryProfiles.forEach((el, index) => {
      let currentProfileQtys;

      currentProfileQtys = el.scheduleReal.map((e, i) => {
        let thisDaysQty = 0;

        if (e.breakfast.active) {
          thisDaysQty += parseInt(e.breakfast.quantity, 10);
        }

        if (e.lunch.active) {
          thisDaysQty += parseInt(e.lunch.quantity, 10);
        }

        if (e.dinner.active) {
          thisDaysQty += parseInt(e.dinner.quantity, 10);
        }

        return thisDaysQty;
      });

      secondaryCustomerTotals.push(currentProfileQtys);
    });
  }

  // console.log(secondaryCustomerTotals);

  secondaryCustomerTotals.forEach((e, i) => {
    if (e[0] >= 2 && e[1] >= 2 && e[2] >= 2 && e[3] >= 2 && e[4] >= 2) {
      metCriteria += 1;
    }
  });

  // console.log(metCriteria);

  const numberOfProfiles = customerInfo.secondaryProfiles.length;


  // accessing price in an array as it's 0 based index
  if (metCriteria > 0) {
    metCriteria -= 1;
  }

  primaryCustomer.breakfastPrice =
    primaryCustomer.lifestyle.prices.breakfast[metCriteria];

  primaryCustomer.lunchPrice =
    primaryCustomer.lifestyle.prices.lunch[metCriteria];

  primaryCustomer.dinnerPrice =
    primaryCustomer.lifestyle.prices.dinner[metCriteria];

  // total base price based on per meal type base price, (before restrictions and extras and discounts)
  primaryCustomer.baseMealPriceTotal =
    primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
    primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

  // discounted basePrice -- this is the actual base price to add up in the total

  if (primaryCustomer.discount == 'senior') {
    let discountAmount = 0;

    if (primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage') {
      discountAmount =
        primaryCustomer.lifestyle.discountSenior /
        100 *
        primaryCustomer.baseMealPriceTotal;
    }

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeSenior == 'Fixed amount'
    ) {
      discountAmount = primaryCustomer.lifestyle.discountSenior;
    }

    primaryCustomer.discountActual = discountAmount;
  }

  if (primaryCustomer.discount == 'student') {
    let discountAmount = 0;

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
    ) {
      discountAmount =
        primaryCustomer.lifestyle.discountStudent /
        100 *
        primaryCustomer.baseMealPriceTotal;
    }

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeStudent == 'Fixed amount'
    ) {
      discountAmount = primaryCustomer.lifestyle.discountStudent;
    }

    primaryCustomer.discountActual = discountAmount;
  }

  // calculating restrictions and specificRestrictions surcharges
  if (primaryCustomer.restrictions.length > 0) {
    primaryCustomer.restrictions.forEach((e, i) => {
      primaryCustomer.restrictionsActual.push(
        Restrictions.findOne({ _id: e }),
      );
    });

    primaryCustomer.restrictionsActual.forEach((e, i) => {
      // console.log(e);
      if (e.hasOwnProperty('extra')) {
        let totalRestrictionsSurcharge = 0;
        // console.log(e);

        const totalBaseMealsCharge =
          primaryCustomer.breakfast.totalQty *
          primaryCustomer.breakfastPrice +
          primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
          primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

        if (e.discountOrExtraType == 'Percentage') {
          totalRestrictionsSurcharge = e.extra / 100 * totalBaseMealsCharge;
        }

        if (e.discountOrExtraType == 'Fixed amount') {
          totalRestrictionsSurcharge =
            (primaryCustomer.breakfast.totalQty +
              primaryCustomer.lunch.totalQty +
              primaryCustomer.dinner.totalQty) *
            e.extra;
        }

        primaryCustomer.restrictionsSurcharges.push(
          totalRestrictionsSurcharge,
        );
      } else {
        primaryCustomer.restrictionsSurcharges.push(0);
      }
    });
  }

  if (primaryCustomer.specificRestrictions.length > 0) {
    primaryCustomer.specificRestrictions.forEach((e, i) => {
      // console.log(e);
      primaryCustomer.specificRestrictionsActual.push(
        Ingredients.findOne({ _id: e._id }),
      );
    });

    // primaryCustomer.specificRestrictionsActual.forEach((e, i) => {
    //   if (e.hasOwnProperty("extra")) {
    //     let totalSurcharges = 0;
    //     console.log(e);

    //     const totalBaseMealsCharge =
    //       primaryCustomer.breakfast.totalQty *
    //         primaryCustomer.breakfastPrice +
    //       primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    //       primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice;

    //     if (e.discountOrExtraType == "Percentage") {
    //       totalSurcharges = e.extra / 100 * totalBaseMealsCharge;
    //     }

    //     if (e.discountOrExtraType == "Fixed amount") {
    //       totalSurcharges =
    //         (primaryCustomer.breakfast.totalQty +
    //           primaryCustomer.lunch.totalQty +
    //           primaryCustomer.dinner.totalQty) *
    //         e.extra;
    //     }

    //     primaryCustomer.specificRestrictionsSurcharges.push(totalSurcharges);
    //   } else {
    //     primaryCustomer.specificRestrictionsSurcharges.push(0);
    //   }
    // });
  }

  // calculating athletic surcharge for all meals
  if (
    primaryCustomer.breakfast.athleticQty > 0 ||
    primaryCustomer.lunch.athleticQty > 0 ||
    primaryCustomer.dinner.athleticQty > 0
  ) {
    let totalAthleticSurcharge = 0;

    if (primaryCustomer.breakfast.athleticQty > 0) {
      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
      ) {
        const extraAthleticPerBreakfast =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.breakfastPrice;

        totalAthleticSurcharge +=
          primaryCustomer.breakfast.athleticQty * extraAthleticPerBreakfast;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
        'Fixed amount'
      ) {
        totalAthleticSurcharge +=
          primaryCustomer.breakfast.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.lunch.athleticQty > 0) {
      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
      ) {
        const extraAthleticPerLunch =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.lunchPrice;

        totalAthleticSurcharge +=
          primaryCustomer.lunch.athleticQty * extraAthleticPerLunch;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
        'Fixed amount'
      ) {
        totalAthleticSurcharge +=
          primaryCustomer.lunch.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.dinner.athleticQty > 0) {
      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic == 'Percentage'
      ) {
        const extraAthleticPerDinner =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.dinnerPrice;

        totalAthleticSurcharge +=
          primaryCustomer.dinner.athleticQty * extraAthleticPerDinner;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeAthletic ==
        'Fixed amount'
      ) {
        totalAthleticSurcharge +=
          primaryCustomer.breakfast.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    primaryCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
  }

  // calculating bodybuilder surcharge for all meals
  if (
    primaryCustomer.breakfast.bodybuilderQty > 0 ||
    primaryCustomer.lunch.bodybuilderQty > 0 ||
    primaryCustomer.dinner.bodybuilderQty > 0
  ) {
    let totalBodybuilderSurcharge = 0;

    if (primaryCustomer.breakfast.bodybuilderQty > 0) {
      if (
        primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
        'Percentage'
      ) {
        const extraBodybuilderPerBreakfast =
          primaryCustomer.lifestyle.extraBodybuilder /
          100 *
          primaryCustomer.breakfastPrice;

        totalBodybuilderSurcharge +=
          primaryCustomer.breakfast.bodybuilderQty *
          extraBodybuilderPerBreakfast;
      }

      if (
        primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
        'Fixed amount'
      ) {
        totalBodybuilderSurcharge +=
          primaryCustomer.breakfast.athleticQty *
          primaryCustomer.lifestyle.extraBodybuilder;
      }
    }

    if (primaryCustomer.lunch.bodybuilderQty > 0) {
      const extraBodybuilderPerLunch =
        primaryCustomer.lifestyle.extraBodybuilder /
        100 *
        primaryCustomer.lunchPrice;

      totalBodybuilderSurcharge +=
        primaryCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
    }

    if (primaryCustomer.dinner.bodybuilderQty > 0) {
      const extraBodybuilderPerDinner =
        primaryCustomer.lifestyle.extraBodybuilder /
        100 *
        primaryCustomer.dinnerPrice;

      totalBodybuilderSurcharge +=
        primaryCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
    }

    primaryCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
  }

  // console.log(primaryCustomer);

  if (discountCodeApplied != null) {
    let discountCodeAmount = 0;

    if (discountCodeApplied.appliesToType == 'whole' ||
      (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == 'All') ||
      (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == primaryCustomer.lifestyle._id)) {
      let subTotal = primaryCustomer.baseMealPriceTotal;

      if (discountCodeApplied.appliesToRestrictionsAndExtras) {
        subTotal += primaryCustomer.totalAthleticSurcharge +
          primaryCustomer.totalBodybuilderSurcharge +
          sum(primaryCustomer.restrictionsSurcharges) +
          sum(primaryCustomer.specificRestrictionsSurcharges);
      }


      if (discountCodeApplied.discountType == 'Percentage') {
        discountCodeAmount = (discountCodeApplied.discountValue / 100) * subTotal;
      } else if (discountCodeApplied.discountType == 'Fixed amount') {
        discountCodeAmount = discountCodeApplied.discountValue;
      }

      if (primaryCustomer.discountActual > 0 && discountCodeApplied.appliesToExistingDiscounts == false) {
        discountCodeAmount = 0;
      }
    }

    primaryCustomer.discountCodeAmount = discountCodeAmount;
  }

  // all of the above for all the secondary profiles
  if (customerInfo.secondaryProfiles.length > 0) {
    customerInfo.secondaryProfiles.forEach((el, index) => {
      const currentCustomer = {
        lifestyle: '',

        breakfastPrice: 0,
        lunchPrice: 0,
        dinnerPrice: 0,
        breakfast: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        lunch: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        dinner: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        deliveryCost: 0,

        discount: customerInfo.secondaryProfiles[index].discount,
        discountActual: 0,

        discountCodeApplies: false,
        discountCodeAmount: 0,

        restrictions: customerInfo.secondaryProfiles[index]
          .restrictions,
        restrictionsActual: [],
        restrictionsSurcharges: [],
        specificRestrictions: customerInfo.secondaryProfiles[index]
          .specificRestrictions,
        specificRestrictionsActual: [],
        specificRestrictionsSurcharges: [],
        preferences: customerInfo.secondaryProfiles[index]
          .subIngredients,
        totalAthleticSurcharge: 0,
        totalBodybuilderSurcharge: 0,
      };

      // the lifestyle for the current secondarycustomer
      currentCustomer.lifestyle = Lifestyles.findOne({ $or: [{ title: el.lifestyle }, { _id: el.lifestyle }] });

      // calculating basePrices for Breakfast, lunch and dinner
      // const numberOfProfiles = this.props.customerInfo.secondaryProfileCount;

      currentCustomer.breakfastPrice =
        currentCustomer.lifestyle.prices.breakfast[metCriteria];

      currentCustomer.lunchPrice =
        currentCustomer.lifestyle.prices.lunch[metCriteria];

      currentCustomer.dinnerPrice =
        currentCustomer.lifestyle.prices.dinner[metCriteria];

      el.scheduleReal.forEach((e, i) => {
        if (e.breakfast.active) {
          currentCustomer.breakfast.totalQty =
            currentCustomer.breakfast.totalQty +
            parseInt(e.breakfast.quantity, 10);

          if (e.breakfast.portions == 'regular') {
            currentCustomer.breakfast.regularQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if (e.breakfast.portions == 'athletic') {
            currentCustomer.breakfast.athleticQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if ((e.breakfast.portions = 'bodybuilder')) {
            currentCustomer.breakfast.bodybuilderQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          }
        }

        if (e.lunch.active) {
          currentCustomer.lunch.totalQty =
            currentCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

          if (e.lunch.portions == 'regular') {
            currentCustomer.lunch.regularQty += parseInt(
              e.lunch.quantity,
              10,
            );
          } else if (e.lunch.portions == 'athletic') {
            currentCustomer.lunch.athleticQty += parseInt(
              e.lunch.quantity,
              10,
            );
          } else if ((e.lunch.portions = 'bodybuilder')) {
            currentCustomer.lunch.bodybuilderQty += parseInt(
              e.lunch.quantity,
              10,
            );
          }
        }

        if (e.dinner.active) {
          currentCustomer.dinner.totalQty =
            currentCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

          if (e.dinner.portions == 'regular') {
            currentCustomer.dinner.regularQty += parseInt(
              e.dinner.quantity,
              10,
            );
          } else if (e.dinner.portions == 'athletic') {
            currentCustomer.dinner.athleticQty += parseInt(
              e.dinner.quantity,
              10,
            );
          } else if ((e.dinner.portions = 'bodybuilder')) {
            currentCustomer.dinner.bodybuilderQty += parseInt(
              e.dinner.quantity,
              10,
            );
          }
        }
      });

      // total base price based on per meal type base price, (before restrictions and extras and discounts)
      currentCustomer.baseMealPriceTotal =
        currentCustomer.breakfast.totalQty * currentCustomer.breakfastPrice +
        currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
        currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

      // discounted basePrice -- this is the actual base price to add up in the total
      if (currentCustomer.discount == 'senior') {
        let discountAmount = 0;

        if (
          currentCustomer.lifestyle.discountOrExtraTypeSenior == 'Percentage'
        ) {
          discountAmount =
            currentCustomer.lifestyle.discountSenior /
            100 *
            currentCustomer.baseMealPriceTotal;
        }

        if (
          currentCustomer.lifestyle.discountOrExtraTypeSenior ==
          'Fixed amount'
        ) {
          discountAmount = currentCustomer.lifestyle.discountSenior;
        }

        currentCustomer.discountActual = discountAmount;
      }

      if (currentCustomer.discount == 'student') {
        let discountAmount = 0;

        if (
          currentCustomer.lifestyle.discountOrExtraTypeStudent == 'Percentage'
        ) {
          discountAmount =
            currentCustomer.lifestyle.discountStudent /
            100 *
            currentCustomer.baseMealPriceTotal;
        }

        if (
          currentCustomer.lifestyle.discountOrExtraTypeStudent ==
          'Fixed amount'
        ) {
          discountAmount = currentCustomer.lifestyle.discountStudent;
        }

        currentCustomer.discountActual = discountAmount;
      }

      // calculating restrictions and specificRestrictions surcharges
      if (currentCustomer.restrictions.length > 0) {
        currentCustomer.restrictions.forEach((e, i) => {
          currentCustomer.restrictionsActual.push(
            Restrictions.findOne({ _id: e }),
          );
        });

        currentCustomer.restrictionsActual.forEach((e, i) => {
          if (e.hasOwnProperty('extra')) {
            let totalRestrictionsSurcharge = 0;
            // console.log(e);

            const totalBaseMealsCharge =
              currentCustomer.breakfast.totalQty *
              currentCustomer.breakfastPrice +
              currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
              currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

            if (e.discountOrExtraType == 'Percentage') {
              totalRestrictionsSurcharge =
                e.extra / 100 * totalBaseMealsCharge;
            }

            if (e.discountOrExtraType == 'Fixed amount') {
              totalRestrictionsSurcharge =
                (currentCustomer.breakfast.totalQty +
                  currentCustomer.lunch.totalQty +
                  currentCustomer.dinner.totalQty) *
                e.extra;
            }

            // console.log(totalRestrictionsSurcharge);

            currentCustomer.restrictionsSurcharges.push(
              totalRestrictionsSurcharge,
            );
          } else {
            currentCustomer.restrictionsSurcharges.push(0);
          }
        });
      }

      // console.log(currentCustomer.restrictionsSurcharges);

      if (currentCustomer.specificRestrictions.length > 0) {
        currentCustomer.specificRestrictions.forEach((e, i) => {
          currentCustomer.specificRestrictionsActual.push(
            Ingredients.findOne({ _id: e._id }),
          );
        });

        // currentCustomer.specificRestrictionsActual.forEach((e, i) => {
        //   if (e.hasOwnProperty("extra")) {
        //     let totalRestrictionsSurcharge = 0;
        //     console.log(e);

        //     const totalBaseMealsCharge =
        //       currentCustomer.breakfast.totalQty *
        //         currentCustomer.breakfastPrice +
        //       currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
        //       currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice;

        //     if (e.discountOrExtraType == "Percentage") {
        //       totalRestrictionsSurcharge =
        //         e.extra / 100 * totalBaseMealsCharge;
        //     }

        //     if (e.discountOrExtraType == "Fixed amount") {
        //       totalRestrictionsSurcharge =
        //         (currentCustomer.breakfast.totalQty +
        //           currentCustomer.lunch.totalQty +
        //           currentCustomer.dinner.totalQty) *
        //         e.extra;
        //     }

        //     console.log(totalRestrictionsSurcharge);

        //     currentCustomer.specificRestrictionsSurcharges.push(
        //       totalRestrictionsSurcharge
        //     );
        //   } else {
        //     currentCustomer.specificrestrictionsSurcharges.push(0);
        //   }
        // });
      }

      // calculating athletic surcharge for all meals
      if (
        currentCustomer.breakfast.athleticQty > 0 ||
        currentCustomer.lunch.athleticQty > 0 ||
        currentCustomer.dinner.athleticQty > 0
      ) {
        let totalAthleticSurcharge = 0;

        if (currentCustomer.breakfast.athleticQty > 0) {
          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Percentage'
          ) {
            const extraAthleticPerBreakfast =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.breakfastPrice;

            totalAthleticSurcharge +=
              currentCustomer.breakfast.athleticQty *
              extraAthleticPerBreakfast;
          }

          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              currentCustomer.breakfast.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.lunch.athleticQty > 0) {
          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Percentage'
          ) {
            const extraAthleticPerLunch =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.lunchPrice;

            totalAthleticSurcharge +=
              currentCustomer.lunch.athleticQty * extraAthleticPerLunch;
          }

          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              currentCustomer.lunch.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.dinner.athleticQty > 0) {
          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Percentage'
          ) {
            const extraAthleticPerDinner =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.dinnerPrice;

            totalAthleticSurcharge +=
              currentCustomer.dinner.athleticQty * extraAthleticPerDinner;
          }

          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ==
            'Fixed amount'
          ) {
            totalAthleticSurcharge +=
              currentCustomer.breakfast.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        currentCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
      }

      // calculating bodybuilder surcharge for all meals
      if (
        currentCustomer.breakfast.bodybuilderQty > 0 ||
        currentCustomer.lunch.bodybuilderQty > 0 ||
        currentCustomer.dinner.bodybuilderQty > 0
      ) {
        let totalBodybuilderSurcharge = 0;

        if (currentCustomer.breakfast.bodybuilderQty > 0) {
          if (
            currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
            'Percentage'
          ) {
            const extraBodybuilderPerBreakfast =
              currentCustomer.lifestyle.extraBodybuilder /
              100 *
              currentCustomer.breakfastPrice;

            totalBodybuilderSurcharge +=
              currentCustomer.breakfast.bodybuilderQty *
              extraBodybuilderPerBreakfast;
          }

          if (
            currentCustomer.lifestyle.discountOrExtraTypeBodybuilder ==
            'Fixed amount'
          ) {
            totalBodybuilderSurcharge +=
              currentCustomer.breakfast.athleticQty *
              currentCustomer.lifestyle.extraBodybuilder;
          }
        }

        if (currentCustomer.lunch.bodybuilderQty > 0) {
          const extraBodybuilderPerLunch =
            currentCustomer.lifestyle.extraBodybuilder /
            100 *
            currentCustomer.lunchPrice;

          totalBodybuilderSurcharge +=
            currentCustomer.lunch.bodybuilderQty * extraBodybuilderPerLunch;
        }

        if (currentCustomer.dinner.bodybuilderQty > 0) {
          const extraBodybuilderPerDinner =
            currentCustomer.lifestyle.extraBodybuilder /
            100 *
            currentCustomer.dinnerPrice;

          totalBodybuilderSurcharge +=
            currentCustomer.dinner.bodybuilderQty * extraBodybuilderPerDinner;
        }

        currentCustomer.totalBodybuilderSurcharge = totalBodybuilderSurcharge;
      }

      if (discountCodeApplied != null) {
        // console.log(discountCodeApplied);

        let discountCodeAmount = 0;

        if (discountCodeApplied.appliesToType == 'whole' ||
          (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == 'All') ||
          (discountCodeApplied.appliesToType == 'lifestyle' && discountCodeApplied.appliesToValue == currentCustomer.lifestyle._id)) {
          let subTotal = currentCustomer.baseMealPriceTotal;

          if (discountCodeApplied.appliesToRestrictionsAndExtras) {
            subTotal += currentCustomer.totalAthleticSurcharge +
              currentCustomer.totalBodybuilderSurcharge +
              sum(currentCustomer.restrictionsSurcharges) +
              sum(currentCustomer.specificRestrictionsSurcharges);
          }


          if (discountCodeApplied.discountType == 'Percentage') {
            discountCodeAmount = (discountCodeApplied.discountValue / 100) * subTotal;
          } else if (discountCodeApplied.discountType == 'Fixed amount') {
            discountCodeAmount = discountCodeApplied.discountValue;
          }


          if (currentCustomer.discountActual > 0 && discountCodeApplied.appliesToExistingDiscounts == false) {
            discountCodeAmount = 0;
          }
        }

        currentCustomer.discountCodeAmount = discountCodeAmount;
      }

      currentCustomer.totalCost =
        currentCustomer.baseMealPriceTotal +
        currentCustomer.totalAthleticSurcharge +
        currentCustomer.totalBodybuilderSurcharge +
        sum(currentCustomer.restrictionsSurcharges) +
        sum(currentCustomer.specificRestrictionsSurcharges);

      currentCustomer.totalCost -= currentCustomer.discountActual;

      if (currentCustomer.discountCodeAmount > 0) {
        currentCustomer.totalCost -= currentCustomer.discountCodeAmount;
      }

      // console.log(currentCustomer);

      // push
      secondaryCustomers.push(currentCustomer);
    });
  }

  let actualDeliveryCost = 0;
  let surchargePerDelivery = 0;

  const selectedPostalCode = PostalCodes.findOne({ title: customerInfo.address.postalCode.substring(0, 3).toUpperCase() });

  // console.log(selectedPostalCode);

  if (selectedPostalCode.hasOwnProperty('extraSurcharge')) {
    surchargePerDelivery = selectedPostalCode.extraSurcharge;
  }

  // console.log(surchargePerDelivery);

  for (
    let delivIndex = 0;
    delivIndex < customerInfo.delivery.length;
    delivIndex++
  ) {
    const daysMealSum =
      parseInt(
        customerInfo.completeSchedule[delivIndex].breakfast,
        10,
      ) +
      parseInt(
        customerInfo.completeSchedule[delivIndex].lunch,
        10,
      ) +
      parseInt(
        customerInfo.completeSchedule[delivIndex].dinner,
        10,
      );

    const deliveryTypeSelected = customerInfo.delivery[
      delivIndex
    ];

    // calculate surcharges

    if (deliveryTypeSelected == '') {
      continue;
    } else if (
      deliveryTypeSelected == 'dayOf' ||
      deliveryTypeSelected == 'nightBefore'
    ) {
      primaryCustomer.deliverySurcharges += surchargePerDelivery;
    } else if (
      // tuesday
      deliveryTypeSelected == 'sundayNight' ||
      deliveryTypeSelected == 'dayOfMonday'
    ) {
      primaryCustomer.deliverySurcharges += surchargePerDelivery;
    } else if (
      // wednesday
      deliveryTypeSelected == 'sundayNight' ||
      deliveryTypeSelected == 'dayOfMonday' ||
      deliveryTypeSelected == 'nightBeforeMonday' ||
      deliveryTypeSelected == 'dayOfTuesday'
    ) {
      primaryCustomer.deliverySurcharges += surchargePerDelivery;
    } else if (
      // thursday
      deliveryTypeSelected == 'mondayNight' ||
      deliveryTypeSelected == 'dayOfTuesday' ||
      deliveryTypeSelected == 'nightBeforeTuesday' ||
      deliveryTypeSelected == 'dayOfWednesday'
    ) {
      primaryCustomer.deliverySurcharges += surchargePerDelivery;
    } else if (
      // friday
      deliveryTypeSelected == 'tuesdayNight' ||
      deliveryTypeSelected == 'dayOfWednesday' ||
      deliveryTypeSelected == 'nightBeforeWednesday' ||
      deliveryTypeSelected == 'dayOfThursday'
    ) {
      primaryCustomer.deliverySurcharges += surchargePerDelivery;
    }


    // calculate actual delivery cost / delivery
    if (deliveryTypeSelected == '') {
      continue;
    } else if (
      deliveryTypeSelected == 'dayOf' ||
      deliveryTypeSelected == 'dayOfFriday' ||
      deliveryTypeSelected == 'dayOfThursday' ||
      deliveryTypeSelected == 'dayOfWednesday' ||
      deliveryTypeSelected == 'dayOfTuesday' ||
      deliveryTypeSelected == 'dayOfMonday'
    ) {
      actualDeliveryCost += 2.5;
    } else if (
      daysMealSum == 1 &&
      (deliveryTypeSelected == 'nightBefore' ||
        deliveryTypeSelected == 'sundayNight' ||
        deliveryTypeSelected == 'mondayNight' ||
        deliveryTypeSelected == 'tuesdayNight' ||
        deliveryTypeSelected == 'nightBeforeMonday' ||
        deliveryTypeSelected == 'nightBeforeTuesday' ||
        deliveryTypeSelected == 'nightBeforeWednesday')
    ) {
      actualDeliveryCost += 2.5;
    } else if (delivIndex == 5) {
      // these explicit conditions because they depend on friday's/thursday's selections
      if (
        customerInfo.delivery[delivIndex - 1] ==
        'dayOfThursday'
      ) {
        if (deliveryTypeSelected == 'nightBeforeThursday') {
          actualDeliveryCost += 2.5;

          // mixing surcharges here
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        }
      } else if (
        customerInfo.delivery[delivIndex - 1] ==
        'dayOfPaired' &&
        customerInfo.delivery[delivIndex - 2] == 'dayOf'
      ) {
        if (deliveryTypeSelected == 'nightBeforeThursday') {
          actualDeliveryCost += 2.5;

          // mixing surcharges here
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        }
      }
    } // else if 5
  }

  // calculate delivery surcharges

  primaryCustomer.deliveryCost = actualDeliveryCost;

  primaryCustomer.totalCost =
    primaryCustomer.baseMealPriceTotal +
    primaryCustomer.totalAthleticSurcharge +
    primaryCustomer.totalBodybuilderSurcharge +
    primaryCustomer.coolerBag +
    sum(primaryCustomer.restrictionsSurcharges) +
    sum(primaryCustomer.specificRestrictionsSurcharges) +
    primaryCustomer.deliveryCost + primaryCustomer.deliverySurcharges;

  primaryCustomer.totalCost -= primaryCustomer.discountActual;

  if (primaryCustomer.discountCodeAmount > 0) {
    primaryCustomer.totalCost -= primaryCustomer.discountCodeAmount;
  }

  primaryCustomer.discountTotal = primaryCustomer.discountCodeAmount;

  primaryCustomer.taxes = 0.13 * (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost));

  let secondaryGroupCost = 0;

  if (customerInfo.secondaryProfiles.length > 0) {
    secondaryCustomers.forEach((e, i) => {
      secondaryGroupCost += e.totalCost;
      primaryCustomer.discountTotal += e.discountCodeAmount;
    });
  }

  primaryCustomer.secondaryGroupTotal = secondaryGroupCost;

  primaryCustomer.groupTotal =
    secondaryGroupCost + primaryCustomer.totalCost + primaryCustomer.taxes;

  primaryCustomer.taxes = parseFloat(primaryCustomer.taxes.toFixed(2));
  primaryCustomer.groupTotal = parseFloat(primaryCustomer.groupTotal.toFixed(2));


  let actualTotal = primaryCustomer.groupTotal;

  if (sub.taxExempt) {
    actualTotal =
      primaryCustomer.groupTotal -
      primaryCustomer.taxes;
  }


  const lineItems = createSubscriptionLineItems(primaryCustomer,
    secondaryCustomers,
    customerInfo.secondaryProfiles.length,
    sub.taxExempt,
    customerInfo.delivery);

  return {
    primaryProfileBilling: primaryCustomer,
    secondaryProfilesBilling: secondaryCustomers,
    actualTotal,
    lineItems,
  };
}
