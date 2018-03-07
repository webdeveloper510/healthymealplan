import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Healthy Meal Plan';
  const firstName = options.firstName;
  const emailAddress = options.email;
  const totalMeals = options.totalMeals;
  const address = options.address;
  const deliveredAt = options.deliveredAt;


  return sendEmail({
    to: emailAddress,
    from: `${applicationName} <support@healthymealplan.ca>`,
    subject: 'Your Healthy Meal Plan order has been delivered',
    template: 'delivery-successful',
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
