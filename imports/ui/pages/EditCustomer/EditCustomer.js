import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import CurrentCustomerEditor from '../../components/CurrentCustomerEditor/CurrentCustomerEditor';
import NotFound from '../NotFound/NotFound';
import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';

const EditCustomer = ({ customer, history, subscription, secondaryAccounts, popTheSnackbar, lifestyles, restrictions }) => (customer ? (
  <div className="EditCurrentCustomer">
    <Grid container className="EditCategory SideContent SideContent--spacer-2x--horizontal">
      <CurrentCustomerEditor
        lifestyles={lifestyles}
        restrictions={restrictions}

        popTheSnackbar={popTheSnackbar}
        secondaryAccounts={secondaryAccounts}
        subscription={subscription}
        customer={customer}
        history={history} />
    </Grid>
  </div>
) : <NotFound />);

EditCustomer.defaultProps = {
  customer: null,
};

EditCustomer.propTypes = {
  customer: PropTypes.object,
  subscription: PropTypes.object,
  secondaryAccounts: PropTypes.arrayOf(Object).isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {
  const customerId = match.params._id;
  const subscription = Meteor.subscribe('user.customer.single', customerId);
  const subscription2 = Meteor.subscribe('subscriptions.single', customerId);
  const subscription3 = Meteor.subscribe('user.secondaryAccounts', customerId);
  const subscription4 = Meteor.subscribe('lifestyles');
  const subscription5 = Meteor.subscribe('restrictions');

  return {
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready(),
    customer: Meteor.users.findOne(customerId),
    subscription: Subscriptions.findOne(customerId),
    secondaryAccounts: Meteor.users.find({ primaryAccount: customerId }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    restrictions: Restrictions.find().fetch()

  };
}, EditCustomer);
