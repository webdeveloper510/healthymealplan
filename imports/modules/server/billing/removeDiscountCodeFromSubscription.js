import { Meteor } from 'meteor/meteor';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Discounts from '../../../api/Discounts/Discounts';

import calculateSubscriptionCost from './calculateSubscriptionCost';

function removeDiscountCodeFromSubscription(subscription, dataToSend, checkBeforeRemoving = null) {
    if (checkBeforeRemoving === 'discount-first-order-only') {
        const discount = Discounts.findOne({ _id: subscription.discountApplied });

        if (discount.hasOwnProperty('usageLimitType')) {
            if (discount.usageLimitType === 'firstOrderOnly') {

                dataToSend.discountCodeRemove = true;
                const subscriptionCalculation = calculateSubscriptionCost(dataToSend);

                console.log('START update subscription');

                Subscriptions.update({ _id: subscription._id }, {
                    $set: {
                        amount: subscriptionCalculation.actualTotal,
                        subscriptionItems: subscriptionCalculation.lineItems,
                    }
                });

                Subscriptions.update({ _id: subscription._id }, {
                    $unset: {
                        discountApplied: '',
                    }
                });

            }
        }
    } // discount first-order only

}

export default removeDiscountCodeFromSubscription;