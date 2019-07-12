import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import GiftCards from '../../../api/GiftCards/GiftCards';
import Discounts from '../../../api/Discounts/Discounts';
import Jobs from '../../../api/Jobs/Jobs';

import calculateSubscriptionCost from '../../../modules/server/billing/calculateSubscriptionCost';
import removeDiscountCodeFromSubscription from '../../../modules/server/billing/removeDiscountCodeFromSubscription';
import chargeCustomerPaymentProfile from '../../../modules/server/authorize/chargeCustomerPaymentProfile';

import sendTransactionSuccessfulDetails from './sendTransactionSuccessfulDetails';
import sendGiftCardDeductionDetails from './sendGiftCardDeductionDetails';


const worker = Job.processJobs(
  'coreJobQueue',
  'slaveChargeJob',
  {
    errorCallback: function(err){
      console.log("SLAVECHARGEJOB ERROR");
      console.log(err);  
    }
  },
  (job, cb) => {
    const jobData = job.data;

    console.log(`Logging from SLAVE CHARGE JOB for Subscription ID: ${jobData.subscriptionId} ${new Date()}`);

    const subscription = Subscriptions.findOne({ _id: jobData.subscriptionId });
    const primaryUser = Meteor.users.findOne({ _id: subscription.customerId });
    let discountOnSubscription = null;

    const dataToSend = {
      id: primaryUser._id,
      address: primaryUser.address,
      lifestyle: primaryUser.lifestyle,
      discount: primaryUser.discount,
      restrictions: primaryUser.restrictions,
      specificRestrictions: primaryUser.specificRestrictions,
      subIngredients: primaryUser.preferences,
      platingNotes: primaryUser.platingNotes,
      secondary: false,
      completeSchedule: subscription.completeSchedule,
      secondaryProfiles: [],
      subscriptionId: subscription._id,
      delivery: subscription.delivery,
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
      discountOnSubscription = Discounts.findOne({ _id: subscription.discountApplied });
      dataToSend.discountCode = discountOnSubscription._id;
      dataToSend.discountCodeRemove = false;
    }

    const finalSubscriptionAmount = calculateSubscriptionCost(dataToSend);
    // console.log(finalSubscriptionAmount);

    if (subscription.paymentMethod === 'card') {

      if (subscription.hasOwnProperty('giftCardApplied')) {

        const giftCard = GiftCards.findOne({ _id: subscription.giftCardApplied });
        const giftCardBalance = giftCard.balance;


        if (giftCard.balance >= finalSubscriptionAmount.actualTotal) {

          const balanceToUpdate = giftCardBalance - finalSubscriptionAmount.actualTotal;
          const isDepleted = giftCardBalance == 0;

          GiftCards.update({ _id: giftCard._id }, {
            $set: {
              balance: balanceToUpdate,
              isDepleted,
            },
          });

            if (subscription.hasOwnProperty('discountApplied')) {
                removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
            }

            sendGiftCardDeductionDetails({
              paymentMethodIsCard: subscription.paymentMethod === 'card',
              paymentMethod: subscription.paymentMethod,

              customerId: primaryUser._id,
              customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
              customerEmail: primaryUser.emails[0].address,
              subscriptionId: jobData.subscriptionId,
              subscriptionAmount: finalSubscriptionAmount.actualTotal,

              giftCardPresent: true,
              partialCharge: false,
              giftCardCode: giftCard.code,
              giftCardDeductionAmount: finalSubscriptionAmount.actualTotal,

              totalCharge: finalSubscriptionAmount.actualTotal,

              // subject: `$${finalSubscriptionAmount.actualTotal} Gift card transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
              subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,

            });

          // record the transaction

        } else if (giftCard.balance < finalSubscriptionAmount.actualTotal && giftCard.balance != 0) {

          console.log('PARTIAL DEDUCTION');// DEDUCT_GIFT_CARD(0);
          let partialCardChargeAmount = 0;
          partialCardChargeAmount = finalSubscriptionAmount.actualTotal - giftCard.balance;

          const syncChargeCustomerPaymentProfile = Meteor.wrapAsync(chargeCustomerPaymentProfile);
            let chargeCustomerPaymentProfileRes;

            try {
                chargeCustomerPaymentProfileRes = syncChargeCustomerPaymentProfile(
                    subscription.authorizeCustomerProfileId,
                    subscription.authorizePaymentProfileId,
                    parseFloat(partialCardChargeAmount.toFixed(2)),
                );

            } catch (e) {
                console.log("Error in catch");
                console.log(e);

                // send failure email
                job.fail();

                cb();
            }

            if (chargeCustomerPaymentProfileRes) {
              if (chargeCustomerPaymentProfileRes.messages.resultCode === 'Ok'
                && chargeCustomerPaymentProfileRes.transactionResponse.responseCode === '1') {
                console.log('transaction successful');

                if (subscription.hasOwnProperty('discountApplied')) {
                    removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
                }

                sendTransactionSuccessfulDetails({
                  paymentMethodIsCard: true,
                  authorizeTransactionId: chargeCustomerPaymentProfileRes.transactionResponse.transId,
                  accountNumber: chargeCustomerPaymentProfileRes.transactionResponse.accountNumber,
                  accountType: chargeCustomerPaymentProfileRes.transactionResponse.accountType,

                  customerId: primaryUser._id,
                  customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
                  customerEmail: primaryUser.emails[0].address,
                  subscriptionId: jobData.subscriptionId,
                  subscriptionAmount: finalSubscriptionAmount.actualTotal,

                  giftCardPresent: true,
                  partialCharge: true,
                  giftCardCode: giftCard.code,
                  giftCardDeductionAmount: giftCard.balance,

                  totalCharge: partialCardChargeAmount,

                  // subject: `[${chargeCustomerPaymentProfileRes.transactionResponse.transId}] $${finalSubscriptionAmount.actualTotal} Transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
                  subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,
                });

                GiftCards.update({ _id: giftCard._id }, {
                  $set: {
                    balance: 0,
                    isDepleted: true,
                  },
                });


                // record partial charge
              } else {
                console.log('transaction failed');
              }
            }

        } else {

          const syncChargeCustomerPaymentProfile = Meteor.wrapAsync(chargeCustomerPaymentProfile);
          let chargeCustomerPaymentProfileRes;
          try {
                chargeCustomerPaymentProfileRes = syncChargeCustomerPaymentProfile(
                    subscription.authorizeCustomerProfileId,
                    subscription.authorizePaymentProfileId,
                    parseFloat(finalSubscriptionAmount.actualTotal.toFixed(2)),
                );

            } catch (e) {
                console.log("Error in catch");
                console.log(e);

                // send failure email
                job.fail();
                cb();
            }

          console.log(chargeCustomerPaymentProfileRes);

          if (chargeCustomerPaymentProfileRes) {
            if (chargeCustomerPaymentProfileRes.messages.resultCode === 'Ok' &&
              chargeCustomerPaymentProfileRes.transactionResponse.responseCode === '1') {
              console.log('transaction successful');

              if (subscription.hasOwnProperty('discountApplied')) {
                  removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
              }

              // send email to us
              sendTransactionSuccessfulDetails({
                paymentMethodIsCard: true,

                authorizeTransactionId: chargeCustomerPaymentProfileRes.transactionResponse.transId,
                accountNumber: chargeCustomerPaymentProfileRes.transactionResponse.accountNumber,
                accountType: chargeCustomerPaymentProfileRes.transactionResponse.accountType,

                customerId: primaryUser._id,
                customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
                customerEmail: primaryUser.emails[0].address,
                subscriptionId: jobData.subscriptionId,
                subscriptionAmount: finalSubscriptionAmount.actualTotal,

                giftCardPresent: true,
                partialCharge: false,
                giftCardCode: giftCard.code,
                giftCardDeductionAmount: 0,

                totalCharge: finalSubscriptionAmount.actualTotal,

                // subject: `[${chargeCustomerPaymentProfileRes.transactionResponse.transId}] $${finalSubscriptionAmount.actualTotal} Transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
                subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,

              });

              // record card transaction receipt
            } else {
              console.log('transaction failed');
            }
          }
        }

        // if gift card applied
      } else {
        // if gift card not applied
        const syncChargeCustomerPaymentProfile = Meteor.wrapAsync(chargeCustomerPaymentProfile);

        let chargeCustomerPaymentProfileRes;

        try {
            chargeCustomerPaymentProfileRes = syncChargeCustomerPaymentProfile(
                subscription.authorizeCustomerProfileId,
                subscription.authorizePaymentProfileId,
                finalSubscriptionAmount.actualTotal,
            );

        } catch (e) {
            console.log("Error in catch");
            console.log(e);

            // send failure email
          job.fail();
        }

        console.log("Charge customer profile RES: ");

        if (chargeCustomerPaymentProfileRes) {
          if (chargeCustomerPaymentProfileRes.messages.resultCode === 'Ok' &&
            chargeCustomerPaymentProfileRes.transactionResponse.responseCode === '1') {

            console.log('transaction successful');

            if (subscription.hasOwnProperty('discountApplied')) {
                removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
            }

            sendTransactionSuccessfulDetails({
              paymentMethodIsCard: true,
              authorizeTransactionId: chargeCustomerPaymentProfileRes.transactionResponse.transId,
              accountNumber: chargeCustomerPaymentProfileRes.transactionResponse.accountNumber,
              accountType: chargeCustomerPaymentProfileRes.transactionResponse.accountType,

              customerId: primaryUser._id,
              customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
              customerEmail: primaryUser.emails[0].address,
              subscriptionId: jobData.subscriptionId,
              subscriptionAmount: finalSubscriptionAmount.actualTotal,

              giftCardPresent: false,
              partialCharge: false,
              giftCardCode: '',
              giftCardDeductionAmount: 0,
              totalCharge: finalSubscriptionAmount.actualTotal,

              // subject: `[${chargeCustomerPaymentProfileRes.transactionResponse.transId}] $${finalSubscriptionAmount.actualTotal} Transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
                subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,
            });

          } else {
            console.log('transaction failed');
          }
        }
        // let us know it failed
      }


    } else if (subscription.paymentMethod == 'cash' || subscription.paymentMethod == 'interac') {

      if (subscription.hasOwnProperty('giftCardApplied')) {

        const giftCard = GiftCards.findOne({ _id: subscription.giftCardApplied });
        const giftCardBalance = giftCard.balance;

        if (giftCardBalance >= finalSubscriptionAmount.actualTotal) {

          const balanceToUpdate = giftCardBalance - finalSubscriptionAmount.actualTotal;
          const isDepleted = giftCardBalance == 0;

          GiftCards.update({ _id: giftCard._id }, {
            $set: {
              balance: balanceToUpdate,
              isDepleted,
            },
          });

          if (subscription.hasOwnProperty('discountApplied')) {
              removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
          }

          sendGiftCardDeductionDetails({
            paymentMethodIsCard: subscription.paymentMethod === 'card',
            paymentMethod: subscription.paymentMethod,

            customerId: primaryUser._id,
            customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
            customerEmail: primaryUser.emails[0].address,
            subscriptionId: jobData.subscriptionId,
            subscriptionAmount: finalSubscriptionAmount.actualTotal,

            giftCardPresent: true,
            partialCharge: false,
            giftCardCode: giftCard.code,
            giftCardDeductionAmount: finalSubscriptionAmount.actualTotal,

            totalCharge: finalSubscriptionAmount.actualTotal,

            // subject: `$${finalSubscriptionAmount.actualTotal} Gift card transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
            subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,
          });

        } else if (giftCardBalance < finalSubscriptionAmount.actualTotal && giftCardBalance != 0) {
          let partialCardChargeAmount = 0;
          partialCardChargeAmount = finalSubscriptionAmount.actualTotal - giftCardBalance;

            if (subscription.hasOwnProperty('discountApplied')) {
                removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
            }

          sendGiftCardDeductionDetails({
            paymentMethodIsCard: subscription.paymentMethod === 'card',
            paymentMethod: subscription.paymentMethod,

            customerId: primaryUser._id,
            customerName: `${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
            customerEmail: primaryUser.emails[0].address,
            subscriptionId: jobData.subscriptionId,
            subscriptionAmount: finalSubscriptionAmount.actualTotal,

            giftCardPresent: true,
            partialCharge: true,
            giftCardCode: giftCard.code,
            giftCardDeductionAmount: giftCardBalance,

            totalCharge: partialCardChargeAmount,

            // subject: `$${finalSubscriptionAmount.actualTotal} Partial Gift card transaction successful for ${primaryUser.profile.name.first} ${primaryUser.profile.name.last || ''}`,
            subject: `Receipt for your Vittle for ${moment().format('MMMM D, YYYY')}`,
          });


          GiftCards.update({ _id: giftCard._id }, {
            $set: {
              balance: 0,
              isDepleted: true,
            },
          });


        } else {

            if (subscription.hasOwnProperty('discountApplied')) {
                removeDiscountCodeFromSubscription(subscription, dataToSend, 'discount-first-order-only');
            }
        }
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
