import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Discounts from '../../../api/Discounts/Discounts';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Sides from '../../../api/Sides/Sides';

import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';
import Loading from '../../components/Loading/Loading';

import NotFound from '../NotFound/NotFound';

const EditDiscount = ({ discount, history, popTheSnackbar, lifestyles, sides, customers, loading }) => (loading ? <Loading /> : discount ? (
  <div>
    <Grid container className="EditDiscount SideContent SideContent--spacer-2x--horizontal">
      <DiscountEditor
        discount={discount}
        popTheSnackbar={popTheSnackbar}
        customers={customers}
        history={history}
        lifestyles={lifestyles}
        sides={sides}
        newDiscount={false}
        loading={loading}
      />
    </Grid>
  </div>
) : <NotFound />);

// EditDiscount.defaultProps = {
//   discount: null,
//   newDiscount: false,
// };

EditDiscount.propTypes = {
  discount: PropTypes.object,
  history: PropTypes.object.isRequired,
  customers: PropTypes.array.isRequried,
};

export default withTracker(({ match }) => {
  const discountId = match.params._id;
  const subscription = Meteor.subscribe('discounts.view', discountId);
  const subscription1 = Meteor.subscribe('users.customers.primary');
  const subscription2 = Meteor.subscribe('lifestyles');
  // const subscription3 = Meteor.subscribe('sides');

  return {
    loading: !subscription.ready() && !subscription1.ready() && !subscription2.ready(),
    discount: Discounts.findOne(discountId),
    customers: Meteor.users.find({ roles: ['customer'] }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    // sides: Sides.find().fetch(),
  };
})(EditDiscount);
