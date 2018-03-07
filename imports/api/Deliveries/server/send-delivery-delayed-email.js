import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Healthy Meal Plan';
  const firstName = options.firstName;
  const emailAddress = options.email;
  const totalMeals = options.totalMeals;


  return sendEmail({
    to: emailAddress,
    from: `${applicationName} <support@healthymealplan.ca>`,
    subject: `We are experiencing delays delivering your ${applicationName} order`,
    template: 'delivery-delayed',
    templateVars: {
      applicationName,
      firstName,
      totalMeals,
    },
  })
    .catch((error) => {
      throw new Meteor.Error('500', `${error}`);
    });
};
