import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Ingredients from '../../../api/Ingredients/Ingredients';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Discounts from '../../../api/Discounts/Discounts';
import Sides from '../../../api/Sides/Sides';

import createSubscriptionLineItems from './createSubscriptionLineItems';

import { DELIVERYCOST } from '../../constants';

import sum from 'lodash/sum';
import sumBy from 'lodash/sumBy';

export default function calculateSubscriptionCost(customerInfo) {
  const sub = Subscriptions.findOne({ customerId: customerInfo.id });

  const primaryCustomer = {
    lifestyle: '',
    breakfastPrice: 0,
    lunchPrice: 0,
    dinnerPrice: 0,
    chefsChoiceBreakfastPrice: 0,
    chefsChoiceLunchPrice: 0,
    chefsChoiceDinnerPrice: 0,
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
    chefsChoiceBreakfast: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    chefsChoiceLunch: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    chefsChoiceDinner: {
      totalQty: 0,
      regularQty: 0,
      athleticQty: 0,
      bodybuilderQty: 0,
    },
    sides: [],
    sidesTotal: 0,
    sidesTotalQty: 0,
    // coolerBag: customerInfo.coolerBag ? 20 : 0,
    coolerBag: 0,
    deliveryCost: 0,

    discount: customerInfo.discount,
    discountActual: 0,

    discountCodeApplies: false,
    dicsountCodeAmount: 0,
    discountCodeRemove: customerInfo.discountCodeRemove || false,

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
  // &&
  //
  if ((sub.hasOwnProperty('discountApplied') || customerInfo.hasOwnProperty('discountCode'))
    && !customerInfo.discountCodeRemove) {
    discountCodePresent = true;
  }

  if (discountCodePresent && !customerInfo.discountCodeRemove) {
    if (sub.hasOwnProperty('discountApplied')) {
      discountCodeApplied = Discounts.findOne({ _id: sub.discountApplied });
    }

    if (customerInfo.discountCode) {
      if (customerInfo.discountCode.length > 0) {
        discountCodeApplied = Discounts.findOne({ $or: [{ title: customerInfo.discountCode }, { _id: customerInfo.discountCode }] });
      }
    }

    primaryCustomer.discountCodeApplied = discountCodeApplied;
  }

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

      if (e.breakfast.portions === 'regular') {
        primaryCustomer.breakfast.regularQty += parseInt(
          e.breakfast.quantity,
          10,
        );
      } else if (e.breakfast.portions === 'athletic') {
        primaryCustomer.breakfast.athleticQty += parseInt(
          e.breakfast.quantity,
          10,
        );
      } else if ((e.breakfast.portions === 'bodybuilder')) {
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

      if (e.lunch.portions === 'regular') {
        primaryCustomer.lunch.regularQty += parseInt(e.lunch.quantity, 10);
      } else if (e.lunch.portions === 'athletic') {
        primaryCustomer.lunch.athleticQty += parseInt(e.lunch.quantity, 10);
      } else if ((e.lunch.portions === 'bodybuilder')) {
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

      if (e.dinner.portions === 'regular') {
        primaryCustomer.dinner.regularQty += parseInt(e.dinner.quantity, 10);
      } else if (e.dinner.portions === 'athletic') {
        primaryCustomer.dinner.athleticQty += parseInt(e.dinner.quantity, 10);
      } else if ((e.dinner.portions === 'bodybuilder')) {
        primaryCustomer.dinner.bodybuilderQty += parseInt(
          e.dinner.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.dinner.quantity, 10);
    }

    if (e.chefsChoiceBreakfast.active) {
      primaryCustomer.chefsChoiceBreakfast.totalQty =
        primaryCustomer.chefsChoiceBreakfast.totalQty + parseInt(e.chefsChoiceBreakfast.quantity, 10);

      if (e.chefsChoiceBreakfast.portions === 'regular') {
        primaryCustomer.chefsChoiceBreakfast.regularQty += parseInt(e.chefsChoiceBreakfast.quantity, 10);
      } else if (e.chefsChoiceBreakfast.portions === 'athletic') {
        primaryCustomer.chefsChoiceBreakfast.athleticQty += parseInt(e.chefsChoiceBreakfast.quantity, 10);
      } else if ((e.chefsChoiceBreakfast.portions === 'bodybuilder')) {
        primaryCustomer.chefsChoiceBreakfast.bodybuilderQty += parseInt(
          e.chefsChoiceBreakfast.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.chefsChoiceBreakfast.quantity, 10);
    }

    if (e.chefsChoiceLunch.active) {
      primaryCustomer.chefsChoiceLunch.totalQty =
        primaryCustomer.chefsChoiceLunch.totalQty + parseInt(e.chefsChoiceLunch.quantity, 10);

      if (e.chefsChoiceLunch.portions === 'regular') {
        primaryCustomer.chefsChoiceLunch.regularQty += parseInt(e.chefsChoiceLunch.quantity, 10);
      } else if (e.chefsChoiceLunch.portions === 'athletic') {
        primaryCustomer.chefsChoiceLunch.athleticQty += parseInt(e.chefsChoiceLunch.quantity, 10);
      } else if ((e.chefsChoiceLunch.portions === 'bodybuilder')) {
        primaryCustomer.chefsChoiceLunch.bodybuilderQty += parseInt(
          e.chefsChoiceLunch.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.chefsChoiceLunch.quantity, 10);
    }

    if (e.chefsChoiceDinner.active) {
      primaryCustomer.chefsChoiceDinner.totalQty =
        primaryCustomer.chefsChoiceDinner.totalQty + parseInt(e.chefsChoiceDinner.quantity, 10);

      if (e.chefsChoiceDinner.portions === 'regular') {
        primaryCustomer.chefsChoiceDinner.regularQty += parseInt(e.chefsChoiceDinner.quantity, 10);
      } else if (e.chefsChoiceDinner.portions === 'athletic') {
        primaryCustomer.chefsChoiceDinner.athleticQty += parseInt(e.chefsChoiceDinner.quantity, 10);
      } else if ((e.chefsChoiceDinner.portions === 'bodybuilder')) {
        primaryCustomer.chefsChoiceDinner.bodybuilderQty += parseInt(
          e.chefsChoiceDinner.quantity,
          10,
        );
      }

      thisDaysQty += parseInt(e.chefsChoiceDinner.quantity, 10);
    }

    if (e.sides.length > 0) {
      console.log(e.sides);
      //maybe use reduce wull prolly take two loops one after other
      e.sides.forEach(currentSide => {
        console.log("going here")
          const side = Sides.findOne({ _id: currentSide._id });

          const variant = side.variants.find(e => e._id === currentSide.variantId);

          console.log("going here")
          primaryCustomer.sidesTotalQty += parseInt(currentSide.quantity, 10);
          primaryCustomer.sidesTotal += parseFloat(variant.price) * parseInt(currentSide.quantity, 10);
          primaryCustomer.sides.push({
              title: currentSide.title,
              _id: currentSide._id,
              variantId: currentSide.variantId,
              lineItemPrice: parseFloat(variant.price) * parseInt(currentSide.quantity, 10),
              quantity: currentSide.quantity,
              variantTitle: variant.name,
          });
      });
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

        if (e.chefsChoiceBreakfast.active) {
          thisDaysQty += parseInt(e.chefsChoiceBreakfast.quantity, 10);
        }

        if (e.chefsChoiceLunch.active) {
          thisDaysQty += parseInt(e.chefsChoiceLunch.quantity, 10);
        }

        if (e.chefsChoiceDinner.active) {
          thisDaysQty += parseInt(e.chefsChoiceDinner.quantity, 10);
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

  primaryCustomer.chefsChoiceBreakfastPrice =
    primaryCustomer.lifestyle.prices.chefsChoiceBreakfast[metCriteria];

  primaryCustomer.chefsChoiceLunchPrice =
    primaryCustomer.lifestyle.prices.chefsChoiceLunch[metCriteria];

  primaryCustomer.chefsChoiceDinnerPrice =
    primaryCustomer.lifestyle.prices.chefsChoiceDinner[metCriteria];

  // total base price based on per meal type base price, (before restrictions and extras and discounts)
  primaryCustomer.baseMealPriceTotal =
    primaryCustomer.breakfast.totalQty * primaryCustomer.breakfastPrice +
    primaryCustomer.lunch.totalQty * primaryCustomer.lunchPrice +
    primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice +
    primaryCustomer.chefsChoiceBreakfast.totalQty * primaryCustomer.chefsChoiceBreakfastPrice +
    primaryCustomer.chefsChoiceLunch.totalQty * primaryCustomer.chefsChoiceLunchPrice +
    primaryCustomer.chefsChoiceDinner.totalQty * primaryCustomer.chefsChoiceDinnerPrice;

  // discounted basePrice -- this is the actual base price to add up in the total

  if (primaryCustomer.discount === 'senior') {
    let discountAmount = 0;

    if (primaryCustomer.lifestyle.discountOrExtraTypeSenior === 'Percentage') {
      discountAmount =
        primaryCustomer.lifestyle.discountSenior /
        100 *
        primaryCustomer.baseMealPriceTotal;
    }

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeSenior === 'Fixed amount'
    ) {
      discountAmount = primaryCustomer.lifestyle.discountSenior;
    }

    primaryCustomer.discountActual = discountAmount;
  }

  if (primaryCustomer.discount === 'student') {
    let discountAmount = 0;

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeStudent === 'Percentage'
    ) {
      discountAmount =
        primaryCustomer.lifestyle.discountStudent /
        100 *
        primaryCustomer.baseMealPriceTotal;
    }

    if (
      primaryCustomer.lifestyle.discountOrExtraTypeStudent === 'Fixed amount'
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
          primaryCustomer.dinner.totalQty * primaryCustomer.dinnerPrice +
          primaryCustomer.chefsChoiceBreakfast.totalQty * primaryCustomer.chefsChoiceBreakfastPrice +
          primaryCustomer.chefsChoiceLunch.totalQty * primaryCustomer.chefsChoiceLunchPrice +
          primaryCustomer.chefsChoiceDinner.totalQty * primaryCustomer.chefsChoiceDinnerPrice;

        if (e.discountOrExtraType === 'Percentage') {
          totalRestrictionsSurcharge = e.extra / 100 * totalBaseMealsCharge;
        }

        if (e.discountOrExtraType === 'Fixed amount') {
          totalRestrictionsSurcharge =
            (primaryCustomer.breakfast.totalQty +
              primaryCustomer.lunch.totalQty +
              primaryCustomer.dinner.totalQty +
              primaryCustomer.chefsChoiceBreakfast.totalQty +
              primaryCustomer.chefsChoiceLunch.totalQty +
              primaryCustomer.chefsChoiceDinner.totalQty) *
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
    primaryCustomer.dinner.athleticQty > 0 ||
    primaryCustomer.chefsChoiceBreakfast.athleticQty > 0 ||
    primaryCustomer.chefsChoiceLunch.athleticQty > 0 ||
    primaryCustomer.chefsChoiceDinner.athleticQty > 0) {
    let totalAthleticSurcharge = 0;

    if (primaryCustomer.breakfast.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerBreakfast =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.breakfastPrice;

        totalAthleticSurcharge +=
          primaryCustomer.breakfast.athleticQty * extraAthleticPerBreakfast;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.breakfast.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.lunch.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerLunch =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.lunchPrice;

        totalAthleticSurcharge +=
          primaryCustomer.lunch.athleticQty * extraAthleticPerLunch;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.lunch.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.dinner.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerDinner =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.dinnerPrice;

        totalAthleticSurcharge +=
          primaryCustomer.dinner.athleticQty * extraAthleticPerDinner;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.dinner.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.chefsChoiceBreakfast.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerDinner =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.chefsChoiceBreakfastPrice;

        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceBreakfast.athleticQty * extraAthleticPerDinner;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceBreakfast.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.chefsChoiceLunch.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerDinner =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.chefsChoiceLunchPrice;

        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceLunch.athleticQty * extraAthleticPerDinner;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceLunch.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    if (primaryCustomer.chefsChoiceDinner.athleticQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
        const extraAthleticPerDinner =
          primaryCustomer.lifestyle.extraAthletic /
          100 *
          primaryCustomer.chefsChoiceDinnerPrice;

        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceDinner.athleticQty * extraAthleticPerDinner;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
        totalAthleticSurcharge +=
          primaryCustomer.chefsChoiceDinner.athleticQty *
          primaryCustomer.lifestyle.extraAthletic;
      }
    }

    primaryCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
  }

  // calculating bodybuilder surcharge for all meals
  if (
    primaryCustomer.breakfast.bodybuilderQty > 0 ||
    primaryCustomer.lunch.bodybuilderQty > 0 ||
    primaryCustomer.dinner.bodybuilderQty > 0 ||
    primaryCustomer.chefsChoiceBreakfast.bodybuilderQty > 0 ||
    primaryCustomer.chefsChoiceLunch.bodybuilderQty > 0 ||
    primaryCustomer.chefsChoiceDinner.bodybuilderQty > 0
  ) {
    let totalBodybuilderSurcharge = 0;

    if (primaryCustomer.breakfast.bodybuilderQty > 0) {
      if (primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder === 'Percentage') {
        const extraBodybuilderPerBreakfast =
          primaryCustomer.lifestyle.extraBodybuilder /
          100 *
          primaryCustomer.breakfastPrice;

        totalBodybuilderSurcharge +=
          primaryCustomer.breakfast.bodybuilderQty *
          extraBodybuilderPerBreakfast;
      }

      if (primaryCustomer.lifestyle.discountOrExtraTypeBodybuilder === 'Fixed amount') {
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

    if (primaryCustomer.chefsChoiceBreakfast.bodybuilderQty > 0) {
      const extraBodybuilderPerDinner =
        primaryCustomer.lifestyle.extraBodybuilder /
        100 *
        primaryCustomer.chefsChoiceBreakfastPrice;

      totalBodybuilderSurcharge +=
        primaryCustomer.chefsChoiceBreakfast.bodybuilderQty * extraBodybuilderPerDinner;
    }

    if (primaryCustomer.chefsChoiceLunch.bodybuilderQty > 0) {
      const extraBodybuilderPerDinner =
        primaryCustomer.lifestyle.extraBodybuilder /
        100 *
        primaryCustomer.chefsChoiceLunchPrice;

      totalBodybuilderSurcharge +=
        primaryCustomer.chefsChoiceLunch.bodybuilderQty * extraBodybuilderPerDinner;
    }

    if (primaryCustomer.chefsChoiceDinner.bodybuilderQty > 0) {
      const extraBodybuilderPerDinner =
        primaryCustomer.lifestyle.extraBodybuilder /
        100 *
        primaryCustomer.chefsChoiceDinnerPrice;

      totalBodybuilderSurcharge +=
        primaryCustomer.chefsChoiceDinner.bodybuilderQty * extraBodybuilderPerDinner;
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
        chefsChoiceBreakfastPrice: 0,
        chefsChoiceLunchPrice: 0,
        chefsChoiceDinnerPrice: 0,
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
        chefsChoiceBreakfast: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        chefsChoiceLunch: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
        chefsChoiceDinner: {
          totalQty: 0,
          regularQty: 0,
          athleticQty: 0,
          bodybuilderQty: 0,
        },
          sides: [],
          sidesTotal: 0,
          sidesTotalQty: 0,
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

      currentCustomer.chefsChoiceBreakfastPrice =
        currentCustomer.lifestyle.prices.chefsChoiceBreakfast[metCriteria];

      currentCustomer.chefsChoiceLunchPrice =
        currentCustomer.lifestyle.prices.chefsChoiceLunch[metCriteria];

      currentCustomer.chefsChoiceDinnerPrice =
        currentCustomer.lifestyle.prices.chefsChoiceDinner[metCriteria];

      el.scheduleReal.forEach((e, i) => {
        if (e.breakfast.active) {
          currentCustomer.breakfast.totalQty =
            currentCustomer.breakfast.totalQty +
            parseInt(e.breakfast.quantity, 10);

          if (e.breakfast.portions === 'regular') {
            currentCustomer.breakfast.regularQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if (e.breakfast.portions === 'athletic') {
            currentCustomer.breakfast.athleticQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          } else if ((e.breakfast.portions === 'bodybuilder')) {
            currentCustomer.breakfast.bodybuilderQty += parseInt(
              e.breakfast.quantity,
              10,
            );
          }
        }

        if (e.lunch.active) {
          currentCustomer.lunch.totalQty =
            currentCustomer.lunch.totalQty + parseInt(e.lunch.quantity, 10);

          if (e.lunch.portions === 'regular') {
            currentCustomer.lunch.regularQty += parseInt(
              e.lunch.quantity,
              10,
            );
          } else if (e.lunch.portions === 'athletic') {
            currentCustomer.lunch.athleticQty += parseInt(
              e.lunch.quantity,
              10,
            );
          } else if ((e.lunch.portions === 'bodybuilder')) {
            currentCustomer.lunch.bodybuilderQty += parseInt(
              e.lunch.quantity,
              10,
            );
          }
        }

        if (e.dinner.active) {
          currentCustomer.dinner.totalQty =
            currentCustomer.dinner.totalQty + parseInt(e.dinner.quantity, 10);

          if (e.dinner.portions === 'regular') {
            currentCustomer.dinner.regularQty += parseInt(
              e.dinner.quantity,
              10,
            );
          } else if (e.dinner.portions === 'athletic') {
            currentCustomer.dinner.athleticQty += parseInt(
              e.dinner.quantity,
              10,
            );
          } else if ((e.dinner.portions === 'bodybuilder')) {
            currentCustomer.dinner.bodybuilderQty += parseInt(
              e.dinner.quantity,
              10,
            );
          }
        }

        if (e.chefsChoiceBreakfast.active) {
          currentCustomer.chefsChoiceBreakfast.totalQty =
            currentCustomer.chefsChoiceBreakfast.totalQty + parseInt(e.chefsChoiceBreakfast.quantity, 10);

          if (e.chefsChoiceBreakfast.portions === 'regular') {
            currentCustomer.chefsChoiceBreakfast.regularQty += parseInt(
              e.chefsChoiceBreakfast.quantity,
              10,
            );
          } else if (e.chefsChoiceBreakfast.portions === 'athletic') {
            currentCustomer.chefsChoiceBreakfast.athleticQty += parseInt(
              e.chefsChoiceBreakfast.quantity,
              10,
            );
          } else if ((e.chefsChoiceBreakfast.portions === 'bodybuilder')) {
            currentCustomer.chefsChoiceBreakfast.bodybuilderQty += parseInt(
              e.chefsChoiceBreakfast.quantity,
              10,
            );
          }
        }

        if (e.chefsChoiceLunch.active) {
          currentCustomer.chefsChoiceLunch.totalQty =
            currentCustomer.chefsChoiceLunch.totalQty + parseInt(e.chefsChoiceLunch.quantity, 10);

          if (e.chefsChoiceLunch.portions === 'regular') {
            currentCustomer.chefsChoiceLunch.regularQty += parseInt(
              e.chefsChoiceLunch.quantity,
              10,
            );
          } else if (e.chefsChoiceLunch.portions === 'athletic') {
            currentCustomer.chefsChoiceLunch.athleticQty += parseInt(
              e.chefsChoiceLunch.quantity,
              10,
            );
          } else if ((e.chefsChoiceLunch.portions === 'bodybuilder')) {
            currentCustomer.chefsChoiceLunch.bodybuilderQty += parseInt(
              e.chefsChoiceLunch.quantity,
              10,
            );
          }
        }

        if (e.chefsChoiceDinner.active) {
          currentCustomer.chefsChoiceDinner.totalQty =
            currentCustomer.chefsChoiceDinner.totalQty + parseInt(e.chefsChoiceDinner.quantity, 10);

          if (e.chefsChoiceDinner.portions === 'regular') {
            currentCustomer.chefsChoiceDinner.regularQty += parseInt(
              e.chefsChoiceDinner.quantity,
              10,
            );
          } else if (e.chefsChoiceDinner.portions === 'athletic') {
            currentCustomer.chefsChoiceDinner.athleticQty += parseInt(
              e.chefsChoiceDinner.quantity,
              10,
            );
          } else if ((e.chefsChoiceDinner.portions === 'bodybuilder')) {
            currentCustomer.chefsChoiceDinner.bodybuilderQty += parseInt(
              e.chefsChoiceDinner.quantity,
              10,
            );
          }
        }

        if (e.sides.length > 0) {

          //maybe use reduce wull prolly take two loops one after other
          e.sides.forEach(currentSide => {
              const side = Sides.findOne({ _id: currentSide._id });
              const variant = side.variants.find(sideVariant => sideVariant._id === currentSide.variantId);

              currentCustomer.sidesTotalQty += parseInt(currentSide.quantity, 10);
              currentCustomer.sidesTotal += parseFloat(variant.price) * parseInt(currentSide.quantity, 10);
              currentCustomer.sides.push({
                  title: currentSide.title,
                  _id: currentSide._id,
                  variantId: currentSide.variantId,
                  lineItemPrice: parseFloat(variant.price) * parseInt(currentSide.quantity, 10),
                  quantity: currentSide.quantity,
                  variantTitle: variant.name,
              });
          });

        }
      });

      // total base price based on per meal type base price, (before restrictions and extras and discounts)
      currentCustomer.baseMealPriceTotal =
        currentCustomer.breakfast.totalQty * currentCustomer.breakfastPrice +
        currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
        currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice +
        currentCustomer.chefsChoiceBreakfast.totalQty * currentCustomer.chefsChoiceBreakfastPrice +
        currentCustomer.chefsChoiceLunch.totalQty * currentCustomer.chefsChoiceLunchPrice +
        currentCustomer.chefsChoiceDinner.totalQty * currentCustomer.chefsChoiceDinnerPrice;

      // discounted basePrice -- this is the actual base price to add up in the total
      if (currentCustomer.discount === 'senior') {
        let discountAmount = 0;

        if (
          currentCustomer.lifestyle.discountOrExtraTypeSenior === 'Percentage'
        ) {
          discountAmount =
            currentCustomer.lifestyle.discountSenior /
            100 *
            currentCustomer.baseMealPriceTotal;
        }

        if (currentCustomer.lifestyle.discountOrExtraTypeSenior === 'Fixed amount') {
          discountAmount = currentCustomer.lifestyle.discountSenior;
        }

        currentCustomer.discountActual = discountAmount;
      }

      if (currentCustomer.discount === 'student') {
        let discountAmount = 0;

        if (currentCustomer.lifestyle.discountOrExtraTypeStudent === 'Percentage') {
          discountAmount =
            currentCustomer.lifestyle.discountStudent /
            100 *
            currentCustomer.baseMealPriceTotal;
        }

        if (currentCustomer.lifestyle.discountOrExtraTypeStudent === 'Fixed amount') {
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
        console.log('Before calculating retrictions actual');
        currentCustomer.restrictionsActual.forEach((e, i) => {
          if (e.hasOwnProperty('extra')) {
            let totalRestrictionsSurcharge = 0;
            // console.log(e);

            const totalBaseMealsCharge =
              currentCustomer.breakfast.totalQty *
              currentCustomer.breakfastPrice +
              currentCustomer.lunch.totalQty * currentCustomer.lunchPrice +
              currentCustomer.dinner.totalQty * currentCustomer.dinnerPrice +
              currentCustomer.chefsChoiceBreakfast.totalQty * currentCustomer.chefsChoiceBreakfastPrice +
              currentCustomer.chefsChoiceLunch.totalQty * currentCustomer.chefsChoiceLunchPrice +
              currentCustomer.chefsChoiceDinner.totalQty * currentCustomer.chefsChoiceDinnerPrice;

            if (e.discountOrExtraType === 'Percentage') {
              totalRestrictionsSurcharge =
                e.extra / 100 * totalBaseMealsCharge;
            }

            if (e.discountOrExtraType === 'Fixed amount') {
              totalRestrictionsSurcharge =
                (currentCustomer.breakfast.totalQty +
                  currentCustomer.lunch.totalQty +
                  currentCustomer.dinner.totalQty +
                  currentCustomer.chefsChoiceBreakfast.totalQty +
                  currentCustomer.chefsChoiceLunch.totalQty +
                  currentCustomer.chefsChoiceDinner.totalQty) *
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
        currentCustomer.dinner.athleticQty > 0 ||
        currentCustomer.chefsChoiceBreakfast.athleticQty > 0 ||
        currentCustomer.chefsChoiceLunch.athleticQty > 0 ||
        currentCustomer.chefsChoiceDinner.athleticQty > 0
      ) {
        let totalAthleticSurcharge = 0;

        if (currentCustomer.breakfast.athleticQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
            const extraAthleticPerBreakfast =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.breakfastPrice;

            totalAthleticSurcharge +=
              currentCustomer.breakfast.athleticQty *
              extraAthleticPerBreakfast;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.breakfast.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.lunch.athleticQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
            const extraAthleticPerLunch =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.lunchPrice;

            totalAthleticSurcharge +=
              currentCustomer.lunch.athleticQty * extraAthleticPerLunch;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.lunch.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.dinner.athleticQty > 0) {
          if (
            currentCustomer.lifestyle.discountOrExtraTypeAthletic ===
            'Percentage'
          ) {
            const extraAthleticPerDinner =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.dinnerPrice;

            totalAthleticSurcharge +=
              currentCustomer.dinner.athleticQty * extraAthleticPerDinner;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.dinner.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.chefsChoiceBreakfast.athleticQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
            const extraAthleticPerDinner =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.chefsChoiceBreakfastPrice;

            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceBreakfast.athleticQty * extraAthleticPerDinner;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceBreakfast.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.chefsChoiceLunch.athleticQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
            const extraAthleticPerDinner =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.chefsChoiceLunchPrice;

            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceLunch.athleticQty * extraAthleticPerDinner;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceLunch.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        if (currentCustomer.chefsChoiceDinner.athleticQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Percentage') {
            const extraAthleticPerDinner =
              currentCustomer.lifestyle.extraAthletic /
              100 *
              currentCustomer.chefsChoiceDinnerPrice;

            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceDinner.athleticQty * extraAthleticPerDinner;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeAthletic === 'Fixed amount') {
            totalAthleticSurcharge +=
              currentCustomer.chefsChoiceDinner.athleticQty *
              currentCustomer.lifestyle.extraAthletic;
          }
        }

        currentCustomer.totalAthleticSurcharge = totalAthleticSurcharge;
      }

      // calculating bodybuilder surcharge for all meals
      if (
        currentCustomer.breakfast.bodybuilderQty > 0 ||
        currentCustomer.lunch.bodybuilderQty > 0 ||
        currentCustomer.dinner.bodybuilderQty > 0 ||
        currentCustomer.chefsChoiceBreakfast.bodybuilderQty > 0 ||
        currentCustomer.chefsChoiceLunch.bodybuilderQty > 0 ||
        currentCustomer.chefsChoiceDinner.bodybuilderQty > 0
      ) {
        let totalBodybuilderSurcharge = 0;

        if (currentCustomer.breakfast.bodybuilderQty > 0) {
          if (currentCustomer.lifestyle.discountOrExtraTypeBodybuilder === 'Percentage') {
            const extraBodybuilderPerBreakfast =
              currentCustomer.lifestyle.extraBodybuilder /
              100 *
              currentCustomer.breakfastPrice;

            totalBodybuilderSurcharge +=
              currentCustomer.breakfast.bodybuilderQty *
              extraBodybuilderPerBreakfast;
          }

          if (currentCustomer.lifestyle.discountOrExtraTypeBodybuilder === 'Fixed amount') {
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

        if (currentCustomer.chefsChoiceBreakfast.bodybuilderQty > 0) {
          const extraBodybuilderPerDinner =
            currentCustomer.lifestyle.extraBodybuilder /
            100 *
            currentCustomer.chefsChoiceBreakfastPrice;

          totalBodybuilderSurcharge +=
            currentCustomer.chefsChoiceBreakfast.bodybuilderQty * extraBodybuilderPerDinner;
        }

        if (currentCustomer.chefsChoiceLunch.bodybuilderQty > 0) {
          const extraBodybuilderPerDinner =
            currentCustomer.lifestyle.extraBodybuilder /
            100 *
            currentCustomer.chefsChoiceLunchPrice;

          totalBodybuilderSurcharge +=
            currentCustomer.chefsChoiceLunch.bodybuilderQty * extraBodybuilderPerDinner;
        }

        if (currentCustomer.chefsChoiceDinner.bodybuilderQty > 0) {
          const extraBodybuilderPerDinner =
            currentCustomer.lifestyle.extraBodybuilder /
            100 *
            currentCustomer.chefsChoiceDinnerPrice;

          totalBodybuilderSurcharge +=
            currentCustomer.chefsChoiceDinner.bodybuilderQty * extraBodybuilderPerDinner;
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


          if (discountCodeApplied.discountType === 'Percentage') {
            discountCodeAmount = (discountCodeApplied.discountValue / 100) * subTotal;
          } else if (discountCodeApplied.discountType === 'Fixed amount') {
            discountCodeAmount = discountCodeApplied.discountValue;
          }


          if (currentCustomer.discountActual > 0 && discountCodeApplied.appliesToExistingDiscounts === false) {
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
        sum(currentCustomer.specificRestrictionsSurcharges) +
        currentCustomer.sidesTotal;

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
  console.log('Before calculating extra surcharge postal code');

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
      ) +
      parseInt(
        customerInfo.completeSchedule[delivIndex].chefsChoiceBreakfast,
        10,
      ) +
      parseInt(
        customerInfo.completeSchedule[delivIndex].chefsChoiceLunch,
        10,
      ) +
      parseInt(
        customerInfo.completeSchedule[delivIndex].chefsChoiceDinner,
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
      actualDeliveryCost += DELIVERYCOST;
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
      actualDeliveryCost += DELIVERYCOST;
    } else if (delivIndex == 5) {
      // these explicit conditions because they depend on friday's/thursday's selections
      if (
        customerInfo.delivery[delivIndex - 1] ==
        'dayOfThursday'
      ) {
        if (deliveryTypeSelected == 'nightBeforeThursday') {
          actualDeliveryCost += DELIVERYCOST;

          // mixing surcharges here
          primaryCustomer.deliverySurcharges += surchargePerDelivery;
        }
      } else if (
        customerInfo.delivery[delivIndex - 1] ==
        'dayOfPaired' &&
        customerInfo.delivery[delivIndex - 2] == 'dayOf'
      ) {
        if (deliveryTypeSelected == 'nightBeforeThursday') {
          actualDeliveryCost += DELIVERYCOST;

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
    primaryCustomer.deliveryCost + primaryCustomer.deliverySurcharges +
    primaryCustomer.sidesTotal;

  primaryCustomer.totalCost -= primaryCustomer.discountActual;

  if (primaryCustomer.discountCodeAmount > 0) {
    primaryCustomer.totalCost -= primaryCustomer.discountCodeAmount;
  }

  primaryCustomer.discountTotal = primaryCustomer.discountCodeAmount;

  if (customerInfo.validReferralCodePresent && (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost) >= 100)) {
      const taxableTotalAfterReferral = (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost)) - 20;
      primaryCustomer.taxes = 0.13 * taxableTotalAfterReferral;
  } else if (sub.referralCodeApplied && !sub.referralChargeComplete && (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost) >= 100) ) {
      const taxableTotalAfterReferral = (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost)) - 20;
      primaryCustomer.taxes = 0.13 * taxableTotalAfterReferral;
      primaryCustomer.validReferralCodePresent = true;
      primaryCustomer.referralCode = sub.referralCode;
  } else {
      primaryCustomer.taxes = 0.13 * (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost));
  }

  let secondaryGroupCost = 0;

  if (customerInfo.secondaryProfiles.length > 0) {
    secondaryCustomers.forEach((e, i) => {
      secondaryGroupCost += e.totalCost;
      primaryCustomer.discountTotal += e.discountCodeAmount;
    });
  }

  primaryCustomer.secondaryGroupTotal = secondaryGroupCost;

  if (customerInfo.validReferralCodePresent && (primaryCustomer.totalCost + secondaryGroupCost >= 100)) {
      primaryCustomer.groupTotal = ((secondaryGroupCost + primaryCustomer.totalCost) - 20) + primaryCustomer.taxes;
  } else if (sub.referralCodeApplied && !sub.referralChargeComplete && (primaryCustomer.totalCost + sumBy(secondaryCustomers, e => e.totalCost) >= 100) ) {
      primaryCustomer.groupTotal = ((secondaryGroupCost + primaryCustomer.totalCost) - 20) + primaryCustomer.taxes;
  } else {
      primaryCustomer.groupTotal = secondaryGroupCost + primaryCustomer.totalCost + primaryCustomer.taxes;
  }

  primaryCustomer.taxes = parseFloat(primaryCustomer.taxes.toFixed(2));
  primaryCustomer.groupTotal = parseFloat(primaryCustomer.groupTotal.toFixed(2));


  let taxExempt = false;
  let actualTotal = primaryCustomer.groupTotal;
  console.log('Before calculating taxexempt');

  if (sub.hasOwnProperty('taxExempt')) {
    if (sub.taxExempt) {
      actualTotal -= primaryCustomer.taxes;
      taxExempt = true;
    }
  }

  console.log('after calculating taxexempt');

  const lineItems = createSubscriptionLineItems(primaryCustomer,
    secondaryCustomers,
    customerInfo.secondaryProfiles.length,
    taxExempt,
    customerInfo.delivery);

  console.log(lineItems);

  return {
    primaryProfileBilling: primaryCustomer,
    secondaryProfilesBilling: secondaryCustomers,
    actualTotal,
    lineItems,
  };
}
