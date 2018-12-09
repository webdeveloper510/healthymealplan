import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';

  const authorizeTransactionId = options.authorizeTransactionId;
  const accountNumber = options.accountNumber;
  const accountType = options.accountType;

  const customerId = options.customerId;
  const customerName = options.customerName;
  const customerEmail = options.customerEmail;
  const subscriptionId = options.subscriptionId;
  const subscriptionAmount = options.subscriptionAmount;

  const giftCardPresent = options.giftCardPresent;
  const partialCharge = options.partialCharge;

  const giftCardCode = options.giftCardCode;
  const giftCardDeductionAmount = options.giftCardDeductionAmount;

  const totalCharge = options.totalCharge;

  return sendEmail({
    to: process.env.NODE_ENV === 'development' ? ['jivanyesh@gmail.com'] : ['omar@vittle.ca', 'jivanyesh@gmail.com', 'jeremy.bellefeuille@gmail.com'],
    from: `${applicationName} <support@vittle.ca>`,
    subject: options.subject,
    template: 'subscription-charge-receipt',
    templateVars: {
      applicationName,
      authorizeTransactionId,
      accountNumber,
      accountType,
      customerId,
      customerName,
      customerEmail,
      subscriptionId,
      subscriptionAmount,
      giftCardPresent,
      partialCharge,
      giftCardCode,
      giftCardDeductionAmount,
      totalCharge,
      chargeDate: moment().format('D MMMM, YYYY'),
    },
  }).catch((error) => {
    throw new Meteor.Error('500', `${error}`);
  });
};
