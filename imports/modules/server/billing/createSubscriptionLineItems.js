
export default function createSubscriptionLineItems(
  primaryProfileBilling,
  secondaryProfilesBilling,
  secondaryProfileCount,
  taxExempt, deliveryType) {
  const subscriptionItemsReal = [];

  const primaryProfileLineItems = {
    lifestyle: {
      title: primaryProfileBilling.lifestyle.title,
      meals:
        primaryProfileBilling.breakfast.totalQty +
        primaryProfileBilling.lunch.totalQty +
        primaryProfileBilling.dinner.totalQty,

      price:
        primaryProfileBilling.breakfast.totalQty *
        primaryProfileBilling.breakfastPrice +
        primaryProfileBilling.lunch.totalQty *
        primaryProfileBilling.lunchPrice +
        primaryProfileBilling.dinner.totalQty *
        primaryProfileBilling.dinnerPrice,
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

  primaryProfileLineItems.taxes = primaryProfileBilling.taxes;

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
            secondaryProfilesBilling[i].dinner.totalQty,

          price:
            secondaryProfilesBilling[i].breakfast.totalQty *
            secondaryProfilesBilling[i].breakfastPrice +
            secondaryProfilesBilling[i].lunch.totalQty *
            secondaryProfilesBilling[i].lunchPrice +
            secondaryProfilesBilling[i].dinner.totalQty *
            secondaryProfilesBilling[i].dinnerPrice,
        },
        restrictions: [],
      };

      if (secondaryProfilesBilling[i].discountActual > 0) {
        primaryProfileLineItems.discount = {
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

      if (
        secondaryProfilesBilling[i].totalAthleticSurcharge > 0
      ) {
        primaryProfileLineItems.extraAthletic = {
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
        primaryProfileLineItems.extraBodybuilder = {
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
            primaryProfileLineItems.restrictions.push({
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
  // console.log(subscriptionItemsReal);


  return subscriptionItemsReal;
}
