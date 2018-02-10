import { Meteor } from 'meteor/meteor';


import sendEmail from '../../../modules/server/send-email';

export default (options, user) => {
  const applicationName = 'Vittle';
  const firstName = options.profile.name.first;
  const emailAddress = options.email;

  return sendEmail({
    to: emailAddress,
    from: `${applicationName} <support@application.com>`,
    subject: `[${applicationName}] Welcome, ${firstName}!`,
    template: 'delivery-unsuccessful',
    templateVars: {
      applicationName,
      firstName,
      welcomeUrl: Meteor.absoluteUrl('documents'), // e.g., returns http://localhost:3000/documents
    },
  })
    .catch((error) => {
      throw new Meteor.Error('500', `${error}`);
    });
};
