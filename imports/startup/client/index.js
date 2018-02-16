import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../ui/layouts/App/App';
import moment from 'moment';
import tz from 'moment-timezone';

import '../../ui/stylesheets/app.scss';

Meteor.startup(() => render(<App />, document.getElementById('react-root')));

// console.log("Currrent timezone: "); console.log(moment().tz());
// console.log("Current time: "); console.log(moment().format());
// console.log("Updating timezone: "); console.log("'America/Toronto");
// moment.tz.setDefault('America/Toronto');
// console.log("Current time: "); console.log(moment().format());
// console.log("Currrent timezone after updating: "); console.log(moment().tz());
