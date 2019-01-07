import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';
  const firstName = options.firstName;
  const emailAddress = options.email;
  const totalMeals = options.totalMeals;
  const address = options.address;
  const deliveredAt = options.deliveredAt;
  const deliveryDriver = options.deliveryDriver;
  const deliveredNote = options.deliveredNote;


  return sendEmail({
    to: process.env.NODE_ENV == "development" ? 'jivanyesh@gmail.com' : emailAddress,
    from: `${applicationName} <support@vittle.ca>`,
    subject: 'Your Vittle has been delivered',
    template: 'delivery-successful',
    templateVars: {
      applicationName,
      firstName,
      totalMeals,
      address,
      deliveryDriver,
      deliveredAt,
      deliveredNote,
    },
  })
    .catch((error) => {
      throw new Meteor.Error('500', `${error}`);
    });
};
