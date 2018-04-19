import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Sides from '../../../api/Sides/Sides';

import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';

const NewDiscount = ({ history, newDiscount, popTheSnackbar, customers, lifestyles, sides }) => (
  <div>
    <Grid container className="NewDiscount SideContent SideContent--spacer-2x--horizontal">
      <DiscountEditor
        newDiscount={newDiscount}
        customers={customers}
        lifestyles={lifestyles}
        sides={sides}
        history={history}
        popTheSnackbar={popTheSnackbar}
      />
    </Grid>
  </div>
);

NewDiscount.propTypes = {
  history: PropTypes.object.isRequired,
  customers: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newDiscount: PropTypes.bool.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('users.customers.primary');
  const subscription2 = Meteor.subscribe('lifestyles');
  const subscription3 = Meteor.subscribe('sides');

  return {
    newDiscount: true,
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready(),
    customers: Meteor.users.find({ roles: ["customer"], subscriptionId: { $exists: true } }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    sides: Sides.find().fetch(),

  };
}, NewDiscount);

