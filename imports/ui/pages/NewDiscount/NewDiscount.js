import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Sides from '../../../api/Sides/Sides';

import Loading from '../../components/Loading/Loading';

import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';

const NewDiscount = ({ history, popTheSnackbar, customers, lifestyles, loading }) => loading ? <Loading /> : (
  <div>
    <Grid container className="NewDiscount SideContent SideContent--spacer-2x--horizontal">
      <DiscountEditor
        newDiscount={true}
        customers={customers}
        lifestyles={lifestyles}
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
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.customers.primary');
  const subscription2 = Meteor.subscribe('lifestyles');
  // const subscription3 = Meteor.subscribe('sides');

  return {
    loading: !subscription.ready() && !subscription2.ready(),
    customers: Meteor.users.find({ roles: ["customer"] }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    // sides: Sides.find().fetch(),
  };
})(NewDiscount);

