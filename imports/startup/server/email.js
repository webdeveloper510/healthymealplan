import { Meteor } from 'meteor/meteor';

// if (Meteor.isDevelopment) 
process.env.MAIL_URL = `smtp://${encodeURIComponent(Meteor.settings.private.SMTP_USER)}:${encodeURIComponent(Meteor.settings.private.SMTP_PASSWORD)}@${encodeURIComponent(Meteor.settings.private.SMTP_HOST)}:587`;
