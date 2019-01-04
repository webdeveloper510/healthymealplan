import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';
  const firstName = options.firstName;
  const emailAddress = options.email;
  const totalMeals = options.totalMeals;
  const deliveryDriver = options.deliveryDriver;
  const address = options.address;

  return sendEmail({
    to: process.env.NODE_ENV == "development" ? 'jivanyesh@gmail.com' : emailAddress,
    from: `${applicationName} <support@vittle.ca>`,
    subject: `Your Vittle order has left the kitchen`,
    template: 'delivery-in-transit',
    templateVars: {
      applicationName,
      firstName,
      totalMeals,
      deliveryDriver,
      address,
    },
  }).catch((error) => {
    throw new Meteor.Error('500', `${error}`);
  });
};
