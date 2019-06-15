import { Meteor } from 'meteor/meteor';
import moment from 'moment';

import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';

  const customerId = options.customerId;
  const customerName = options.customerName;
  const customerEmail = options.customerEmail;
  const paymentMethod = options.paymentMethod;
  const subscriptionId = options.subscriptionId;
  const subscriptionAmount = options.subscriptionAmount;

  const giftCardCode = options.giftCardCode;
  const giftCardDeductionAmount = options.giftCardDeductionAmount;
  const partialCharge = options.partialCharge;


  const totalCharge = options.totalCharge;

  return sendEmail({
    to: process.env.NODE_ENV === 'development' ? 'jivanyesh@gmail.com' : customerEmail,
    bcc: process.env.NODE_ENV === 'development' ? ['jivanyesh@gmail.com'] : ['omar@vittle.ca', 'jivanyesh@gmail.com', 'jeremy.bellefeuille@gmail.com'],
    from: `${applicationName} <support@vittle.ca>`,
    subject: options.subject,
    template: 'subscription-deduct-giftcard',
    templateVars: {
      applicationName,
      paymentMethod,
      customerId,
      customerName,
      customerEmail,
      subscriptionId,
      subscriptionAmount,
      giftCardCode,
      giftCardDeductionAmount,
      totalCharge,
      partialCharge,
      chargeDate: moment().format('D MMMM, YYYY'),
    },
  }).catch((error) => {
    throw new Meteor.Error('500', `${error}`);
  });
};
