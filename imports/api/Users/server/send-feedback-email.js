import { Meteor } from 'meteor/meteor';

import sendEmail from '../../../modules/server/send-email';

export default (options) => {
    const firstName = options.firstName;
    const emailAddress = options.emailAddress;

    return sendEmail({
        to: emailAddress,
        from: `Vittle <omar@vittle.ca>`,
        subject: `I want your feedback about your Vittle`,
        template: 'feedback-email',
        templateVars: {
            firstName,
        },
    }).catch((error) => {

        throw new Meteor.Error('500', `${error}`);
    });
};
