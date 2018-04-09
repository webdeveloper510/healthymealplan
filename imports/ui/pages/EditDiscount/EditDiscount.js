import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Discounts from '../../../api/Discounts/Discounts';

import DiscountEditor from '../../components/DiscountEditor/DiscountEditor';

import NotFound from '../NotFound/NotFound';

const EditDiscount = ({ discount, history, popTheSnackbar, newDiscount }) => (discount ? (
  <div>
    <Grid container className="EditDiscount SideContent SideContent--spacer-2x--horizontal">
      <LifestyleEditor
        discount={discount}
        popTheSnackbar={popTheSnackbar}
        history={history}
        newDiscount={newDiscount}
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
  // popTheSnackbar: PropTypes.func.isRequired,
  restrictions: PropTypes.array.requried
};

export default createContainer(({ match }) => {
  const discountId = match.params._id;
  const subscription = Meteor.subscribe('discounts.view', discountId);


  return {
    newDiscount: false,
    loading: !subscription.ready(),
    discount: Discounts.findOne(discountId),
  };
}, EditDiscount);
