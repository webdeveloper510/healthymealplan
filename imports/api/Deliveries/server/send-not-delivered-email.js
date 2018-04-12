import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';
  const firstName = options.firstName;
  const emailAddress = options.email;
  const totalMeals = options.totalMeals;
  const address = options.address;
  const deliveredAt = options.deliveredAt;


  return sendEmail({
    to: emailAddress,
    from: `${applicationName} <support@vittle.ca>`,
    subject: `There was an issue delivering your ${applicationName} order`,
    template: 'delivery-unsuccessful',
    templateVars: {
      applicationName,
      firstName,
      totalMeals,
      address,
      deliveredAt,
    },
  })
    .catch((error) => {
      throw new Meteor.Error('500', `${error}`);
    });
};
