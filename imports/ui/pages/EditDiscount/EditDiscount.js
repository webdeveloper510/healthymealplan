import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Discounts from '../../../api/Discounts/Discounts';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Sides from '../../../api/Sides/Sides';

import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';

import NotFound from '../NotFound/NotFound';

const EditDiscount = ({ discount, history, popTheSnackbar, newDiscount, lifestyles, sides, customers, loading }) => (discount ? (
  <div>
    <Grid container className="EditDiscount SideContent SideContent--spacer-2x--horizontal">
      <DiscountEditor
        discount={discount}
        popTheSnackbar={popTheSnackbar}
        customers={customers}
        history={history}
        lifestyles={lifestyles}
        sides={sides}
        newDiscount={newDiscount}
        loading={loading}
      />
    </Grid>
  </div>
) : <NotFound />);

EditDiscount.defaultProps = {
  discount: null,
  newDiscount: false,
};

EditDiscount.propTypes = {
  discount: PropTypes.object,
  history: PropTypes.object.isRequired,
  newDiscount: PropTypes.bool.isRequired,
  customers: PropTypes.array.isRequried,
};

export default createContainer(({ match }) => {
  const discountId = match.params._id;
  const subscription = Meteor.subscribe('discounts.view', discountId);
  const subscription1 = Meteor.subscribe('users.customers.primary');
  const subscription2 = Meteor.subscribe('lifestyles');
  const subscription3 = Meteor.subscribe('sides');

  return {
    newDiscount: false,
    loading: !subscription.ready() && !subscription1.ready() && !subscription2.ready() && !subscription3.ready(),
    discount: Discounts.findOne(discountId),
    customers: Meteor.users.find({ roles: ['customer'] }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    sides: Sides.find().fetch(),
  };
}, EditDiscount);
