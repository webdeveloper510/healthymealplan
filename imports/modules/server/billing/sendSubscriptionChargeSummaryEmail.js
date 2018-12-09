import { Meteor } from 'meteor/meteor';
import sendEmail from '../send-email';
import moment from 'moment';

export default details =>
  // console.log(details.activeSubs);

  sendEmail({
    // to: ['jivanyesh@gmail.com', 'omar@vittle.ca', 'jeremy.bellefeuille@gmail.com'],
    // to: ['jivanyesh@gmail.com', 'jeremy.bellefeuille@gmail.com'],
    to: process.env.NODE_ENV === 'development' ? ['jivanyesh@gmail.com'] : ['omar@vittle.ca', 'jivanyesh@gmail.com', 'jeremy.bellefeuille@gmail.com'],
    from: 'Vittle <support@vittle.ca>',
    subject: `Subscription pre-charge summary for ${moment().format('MMMM Do, YYYY')}`,
    template: 'subscription-pre-charge-summary',
    templateVars: {
      activeSubs: details.activeSubs,
      date: moment().format('MMMM D, YYYY'),
      url: `${Meteor.absoluteUrl()}/billing/${moment().format('YYYY-MMMM-DD')}`,
    },
  }).catch((error) => {
    throw new Meteor.Error('500', `${error}`);
  })
;
