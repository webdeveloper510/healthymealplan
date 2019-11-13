import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Random } from 'meteor/random';
import moment from 'moment';
import tz from 'moment-timezone';

import { Accounts } from 'meteor/accounts-base';
import rateLimit from '../../../modules/rate-limit';

import calculateSubscriptionCost from '../../../modules/server/billing/calculateSubscriptionCost';

import PostalCodes from '../../PostalCodes/PostalCodes';
import Subscriptions from '../../Subscriptions/Subscriptions';
import Discounts from '../../Discounts/Discounts';
import Lifestyles from '../../Lifestyles/Lifestyles';

import Jobs from '../../Jobs/Jobs';

moment.tz.setDefault('America/Toronto');

Meteor.methods({
    'partners.add': function createPartner(data) {
        check(data, Object);

        console.log(data);

        let userId;
        const profile = {
            name: {
                first: data.firstName,
                last: data.lastName,
            },
        };

        try {
            userId = Accounts.createUser({
                email: data.emailAddress,
                profile,
            });

            const randomId = Random.id()

            Roles.addUsersToRoles(userId, ['partner']);

            Meteor.users.update(
                { _id: userId },
                {
                    $set: {
                        partnerURL: data.partnerURL,
                        postalCode: data.postalCode,
                        phone: data.phoneNumber,
                        businessName: data.businessName,
                        partnerDiscountId: data.partnerDiscountId,
                        partnerCreditType: data.partnerCreditType,
                        partnerCreditValue: data.partnerCreditValue,
                        partnerCreditRecurring: data.partnerCreditRecurring,
                    },
                },
            );

            Subscriptions.insert({
                _id: randomId,
                customerId: userId,
                status: 'active',
                paymentMethod: 'cash',
                amount: 0,
                taxExempt: false,
                completeSchedule: [{ breakfast: 0, lunch: 0, dinner: 0, chefsChoiceBreakfast: 0, chefsChoiceLunch: 0, chefsChoiceDinner: 0, sides: 0 }],
                delivery: ['','','','','','',''],
                subscriptionItems: [],

                //partner fields
                referralCredits: 0,
                referralTransactions: [],

            })
        } catch (exception) {
            throw new Meteor.Error('500', exception);
        }
    },
    'partners.delete': function deletePartner(partnerId) {
        check(partnerId, String);

        Meteor.users.remove({_id: partnerId});
        Subscriptions.remove({_id: partnerId});
    },
    'partners.update': function updatePartnerBasic(data) {
        check(data, Object);

        console.log(data);

        Meteor.users.update(
            { _id: data.partnerId },
            {
                $set: {
                    partnerURL: data.partnerURL,
                    postalCode: data.postalCode,
                    phone: data.phoneNumber,
                    businessName: data.businessName,
                    partnerDiscountId: data.partnerDiscountId,
                    partnerCreditType: data.partnerCreditType,
                    partnerCreditValue: data.partnerCreditValue,
                    partnerCreditRecurring: data.partnerCreditRecurring,
                },
            },
        );
    },
});

rateLimit({
    methods: [
        'partners.add',
        'partners.updateBasic',
        'partners.delete',
    ],
    limit: 5,
    timeRange: 1000,
});

