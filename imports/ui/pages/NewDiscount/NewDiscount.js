import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Lifestyles from '../../../api/Lifestyles/Lifestyles';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';

const NewDiscount = ({ history, newDiscount, popTheSnackbar, restrictions, lifestyles }) => (
  <div>
    <Grid container className="NewDiscount SideContent SideContent--spacer-2x--horizontal">
      <DiscountEditor
        newDiscount={newDiscount}
        restrictions={restrictions}
        lifestyles={lifestyles}
        history={history}
        popTheSnackbar={popTheSnackbar}
      />
    </Grid>
  </div>
);

NewDiscount.propTypes = {
  history: PropTypes.object.isRequired,
  restrictions: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newDiscount: PropTypes.bool.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('users.customers');
  const subscription2 = Meteor.subscribe('lifestyles');

  return {
    newDiscount: true,
    loading: !subscription.ready() && subscription2.ready(),
    restrictions: Meteor.users.find({ roles: ["customer"] }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
  };
}, NewDiscount);

