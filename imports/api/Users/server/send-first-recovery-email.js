import { Meteor } from 'meteor/meteor';

import sendEmail from '../../../modules/server/send-email';

export default (options) => {
  const applicationName = 'Vittle';
  const firstName = options.firstName;
  const emailAddress = options.emailAddress;

  return sendEmail({
    to: emailAddress,
    from: `${applicationName} <support@vittle.ca>`,
    subject: `Re: Your recent registration with Vittle`,
    template: 'first-recovery',
    templateVars: {
      applicationName,
      firstName,
    },
  }).catch((error) => {

    throw new Meteor.Error('500', `${error}`);
  });
};
