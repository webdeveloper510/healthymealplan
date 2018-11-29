import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import GiftCards from '../../../api/GiftCards/GiftCards';
import Discounts from '../../../api/Discounts/Discounts';
import Jobs from '../../../api/Jobs/Jobs';

import chargeCustomerPaymentProfile from '../../../modules/server/authorize/chargeCustomerPaymentProfile';

const worker = Job.processJobs(
  'coreJobQueue',
  'slaveChargeJob',
  (job, cb) => {
    const jobData = job.data;

    console.log(`Logging from slave job ${new Date()}`);

    // maybe discount removal here is bad => shift everything to editSubscriptionJob
    // let this just deduct gift card and charge

    const subscription = Subscriptions.findOne({ _id: jobData.subscriptionId });
    const primaryUser = Meteor.users.findOne({ _id: subscription.customerId });
    const dataToSend = {
      id: primaryUser._id,
      address: primaryUser.address,
      lifestyle: primaryUser.lifestyle,
      discount: primaryUser.discount,
      discountCodeRemove,
      restrictions: primaryUser.restrictions,
      specificRestrictions: primaryUser.specificRestrictions,
      subIngredients: primaryUser.preferences,
      platingNotes: primaryUser.platingNotes,
      secondary: false,
      completeSchedule: sub.completeSchedule,
      secondaryProfiles: [],
      subscriptionId: sub._id,
      delivery: sub.delivery,
      scheduleReal: primaryUser.schedule,
      notifications: primaryUser.notifications,
      coolerBag: primaryUser.coolerBag,
      secondaryProfilesRemoved: [],
    };

    if (primaryUser.associatedProfiles > 0) {
      dataToSend.secondary = true;
      const secondaries = Meteor.users.find({ primaryAccount: subscription.customerId }).fetch();

      secondaries.forEach((e, i) => {
        dataToSend.secondaryProfiles.push({
          lifestyle: e.lifestyle,
          scheduleReal: e.schedule,
          subIngredients: e.preferences,
          restrictions: e.restrictions,
          specificRestrictions: e.specificRestrictions,
          discount: e.discount,
        });
      });
    }

    if (subscription.hasOwnProperty('discountApplied')) {
      const discount = Discounts.findOne({ _id: subscription.discountApplied });
      dataToSend.discountCode = discount._id,

      if (discount.hasOwnProperty('usageLimitType')) {
        if (discoount.usageLimitType == "firstOrderOnly") {
          Subscriptions.update({ _id: jobData.subscriptionId }, {
            $unset: {
              discountApplied: "",
            }
          });

          dataToSend.discountCodeRemove = true;
        } else {
          dataToSend.discountCodeRemove = false;
        }
      }
    }

    const finalSubscriptionAmount = calculateSubscriptionAmount(dataToSend);

    console.log(finalSubscriptionAmount);

    job.done();

    cb();

    if (subscription.paymentMethod === "card") {

      if (subscription.hasOwnProperty('giftCardApplied')) {

        const giftCard = GiftCards.findOne({ _id: subscription.giftCardApplied });
        const giftCardBalance = giftCard.balance;


        if (giftCard.balance == 0 && !giftCard.isDepleted) {

          GiftCards.update({ _id: giftCard._id }, {
            $set: { isDepleted: true, }
          });

          // let us know gift card is depleted

          chargeCustomerPaymentProfile(finalSubscriptionAmount);

          // record card transaction receipt

        } else if (giftCard.balance >= finalSubscriptionAmount) {

          const balanceToUpdate = giftCardBalance - finalSubscriptionAmount;

          GiftCards.update({ _id: giftCard._id }, {
            $set: {
              balance: balanceToUpdate,
            }
          });

          // record the transaction

        } else if (giftCard.balance < finalSubscriptionAmount && giftCard.balance != 0) {

          // DEDUCT_GIFT_CARD(0);
          let partialCardChargeAmount = 0;
          partialCardChargeAmount = finalSubscriptionAmount - giftCard.balance;

          if (subscription.paymentMethod === "card") {
            chargeCustomerPaymentProfile(partialCardChargeAmount)
            // record card transaction receipt

          } else {

            Subscriptions.findOne({ _id: subscription._id }, {
              $set: {
                status: 'paused',
              }
            });

            // let us know this custo
          }
        }

        // if gift card applied 
      } else {
        // if gift card not applied

        chargeCustomerPaymentProfile(finalSubscriptionAmount);
        // record card transaction receipt

        // let us know it failed
      }


    } else if (subscription.paymentMethod == "cash" || subscription.paymentMethod == "interac") {
      if (giftCard.balance == 0 && !giftCard.isDepleted) {

        GiftCards.update({ _id: giftCard._id }, {
          $set: { isDepleted: true, }
        });

        // let us know gift card is depleted

        // add transaction to gift card

      } else if (giftCard.balance >= finalSubscriptionAmount) {

        const balanceToSet = giftCardBalance - finalSubscriptionAmount;


        GiftCards.update({ _id: giftCard._id }, {
          $set: {

          }
        });

      } else if (giftCard.balance < finalSubscriptionAmount && giftCard.balance != 0) {

        let partialCardChargeAmount = 0;
        partialCardChargeAmount = finalSubscriptionAmount - giftCard.balance;

        Subscriptions.update({ _id: subscription._id }, {
          $set: {
            status: 'paused',
          }
        });

      }
    }


    // set job done
    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
