
export default function createSubscriptionLineItems(
  primaryProfileBilling,
  secondaryProfilesBilling,
  secondaryProfileCount,
  taxExempt) {
  const subscriptionItemsReal = [];

  const primaryProfileLineItems = {
    lifestyle: {
      title: primaryProfileBilling.lifestyle.title,
      meals:
        primaryProfileBilling.breakfast.totalQty +
        primaryProfileBilling.lunch.totalQty +
        primaryProfileBilling.dinner.totalQty +
        primaryProfileBilling.chefsChoiceBreakfast.totalQty +
        primaryProfileBilling.chefsChoiceLunch.totalQty +
        primaryProfileBilling.chefsChoiceDinner.totalQty,

      price:
        primaryProfileBilling.breakfast.totalQty *
        primaryProfileBilling.breakfastPrice +
        primaryProfileBilling.lunch.totalQty *
        primaryProfileBilling.lunchPrice +
        primaryProfileBilling.dinner.totalQty *
        primaryProfileBilling.dinnerPrice +
        primaryProfileBilling.chefsChoiceBreakfast.totalQty *
        primaryProfileBilling.chefsChoiceBreakfastPrice +
        primaryProfileBilling.chefsChoiceLunch.totalQty *
        primaryProfileBilling.chefsChoiceLunchPrice +
        primaryProfileBilling.chefsChoiceDinner.totalQty *
        primaryProfileBilling.chefsChoiceDinnerPrice,
    },
    restrictions: [],
  };

  if (primaryProfileBilling.discountActual > 0) {
    primaryProfileLineItems.discount = {
      title:
        primaryProfileBilling.discount.charAt(0).toUpperCase() +
        primaryProfileBilling.discount.substr(
          1,
          primaryProfileBilling.discount.length,
        ),
      amount: primaryProfileBilling.discountActual,
    };
  }

  if (primaryProfileBilling.discountCodeAmount > 0) {
    primaryProfileLineItems.discountCode = {
      title: primaryProfileBilling.discountCodeApplied.title,
      amount: primaryProfileBilling.discountCodeAmount,
    };
  }

  if (primaryProfileBilling.totalAthleticSurcharge > 0) {
    primaryProfileLineItems.extraAthletic = {
      title: 'Athletic',
      amount: primaryProfileBilling.totalAthleticSurcharge,
      actual: primaryProfileBilling.lifestyle.extraAthletic,
      type:
        primaryProfileBilling.lifestyle
          .discountOrExtraTypeAthletic,
    };
  }

  if (primaryProfileBilling.totalBodybuilderSurcharge > 0) {
    primaryProfileLineItems.extraBodybuilder = {
      title: 'Bodybuilder',
      amount: primaryProfileBilling.totalBodybuilderSurcharge,
      actual: primaryProfileBilling.lifestyle.extraBodybuilder,
      type:
        primaryProfileBilling.lifestyle
          .discountOrExtraTypeBodybuilder,
    };
  }

  if (primaryProfileBilling.restrictionsActual.length > 0) {
    primaryProfileBilling.restrictionsActual.forEach((e, i) => {
      primaryProfileLineItems.restrictions.push({
        title: e.title,
        extra: e.extra,
        type: e.discountOrExtraType,
        surcharge:
          primaryProfileBilling.restrictionsSurcharges[i],
      });
    });
  }

  if (primaryProfileBilling.deliveryCost > 0) {
    primaryProfileLineItems.deliveryCost =
      primaryProfileBilling.deliveryCost;
  }

  if (primaryProfileBilling.deliverySurcharges > 0) {
    primaryProfileLineItems.deliverySurcharges =
      primaryProfileBilling.deliverySurcharges;
  }

  primaryProfileLineItems.taxes = primaryProfileBilling.groupTotal - primaryProfileBilling.taxes;

  if (taxExempt) {
    primaryProfileLineItems.taxes =
      primaryProfileBilling.groupTotal -
      primaryProfileBilling.taxes;
  } else {
    primaryProfileLineItems.taxExempt = true;
    primaryProfileLineItems.total =
      primaryProfileBilling.groupTotal;
  }

  subscriptionItemsReal.push(primaryProfileLineItems);

  if (secondaryProfileCount > 0) {
    secondaryProfilesBilling.forEach((e, i) => {
      const currentProfileLineItems = {
        lifestyle: {
          title: secondaryProfilesBilling[i].lifestyle.title,
          meals:
            secondaryProfilesBilling[i].breakfast.totalQty +
            secondaryProfilesBilling[i].lunch.totalQty +
            secondaryProfilesBilling[i].dinner.totalQty +
            secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty +
            secondaryProfilesBilling[i].chefsChoiceLunch.totalQty +
            secondaryProfilesBilling[i].chefsChoiceDinner.totalQty,

          price:
            secondaryProfilesBilling[i].breakfast.totalQty *
            secondaryProfilesBilling[i].breakfastPrice +
            secondaryProfilesBilling[i].lunch.totalQty *
            secondaryProfilesBilling[i].lunchPrice +
            secondaryProfilesBilling[i].dinner.totalQty *
            secondaryProfilesBilling[i].dinnerPrice +
            secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty *
            secondaryProfilesBilling[i].chefsChoiceBreakfastPrice +
            secondaryProfilesBilling[i].chefsChoiceLunch.totalQty *
            secondaryProfilesBilling[i].chefsChoiceLunchPrice +
            secondaryProfilesBilling[i].chefsChoiceDinner.totalQty *
            secondaryProfilesBilling[i].chefsChoiceDinnerPrice,
        },
        restrictions: [],
      };

      if (secondaryProfilesBilling[i].discountActual > 0) {
        currentProfileLineItems.discount = {
          title:
            secondaryProfilesBilling[i].discount
              .charAt(0)
              .toUpperCase() +
            secondaryProfilesBilling[i].discount.substr(
              1,
              secondaryProfilesBilling[i].discount.length,
            ),
          amount: secondaryProfilesBilling[i].discountActual,
        };
      }


      if (secondaryProfilesBilling[i].discountCodeAmount > 0) {
        currentProfileLineItems.discountCode = {
          title: primaryProfileBilling.discountCodeApplied.title,
          amount: secondaryProfilesBilling[i].discountCodeAmount,
        };
      }


      if (
        secondaryProfilesBilling[i].totalAthleticSurcharge > 0
      ) {
        currentProfileLineItems.extraAthletic = {
          title: 'Athletic',
          amount:
            secondaryProfilesBilling[i].totalAthleticSurcharge,
          actual:
            secondaryProfilesBilling[i].lifestyle.extraAthletic,
          type:
            secondaryProfilesBilling[i].lifestyle
              .discountOrExtraTypeAthletic,
        };
      }

      if (
        secondaryProfilesBilling[i].totalBodybuilderSurcharge > 0
      ) {
        currentProfileLineItems.extraBodybuilder = {
          title: 'Bodybuilder',
          amount:
            secondaryProfilesBilling[i]
              .totalBodybuilderSurcharge,
          actual:
            secondaryProfilesBilling[i].lifestyle
              .extraBodybuilder,
          type:
            secondaryProfilesBilling[i].lifestyle
              .discountOrExtraTypeBodybuilder,
        };
      }

      if (
        secondaryProfilesBilling[i].restrictionsActual.length > 0
      ) {
        secondaryProfilesBilling[i].restrictionsActual.forEach(
          (restriction, restrictionIndex) => {
            currentProfileLineItems.restrictions.push({
              title: restriction.title,
              extra: restriction.extra,
              type: restriction.discountOrExtraType,
              surcharge: secondaryProfilesBilling[i].restrictionsSurcharges[restrictionIndex],
            });
          },
        );
      }

      subscriptionItemsReal.push(currentProfileLineItems);
    });
  }

  return subscriptionItemsReal;
}
