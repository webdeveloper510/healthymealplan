import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import CurrentCustomerEditor from '../../components/CurrentCustomerEditor/CurrentCustomerEditor';
import NotFound from '../NotFound/NotFound';

const EditCustomer = ({ customer, history }) => (customer ? (
  <div className="EditCurrentCustomer">
    <Grid container className="EditCategory SideContent SideContent--spacer-2x--horizontal">
      <CurrentCustomerEditor customer={customer} history={history} />
    </Grid>
  </div>
) : <NotFound />);

EditCustomer.defaultProps = {
  customer: null,
};

EditCustomer.propTypes = {
  customer: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const customerId = match.params._id;
  const subscription = Meteor.subscribe('user.customer.single', customerId);

  return {
    loading: !subscription.ready(),
    customer: Metoer.users.findOne(customerId),
  };
}, EditCustomer);
