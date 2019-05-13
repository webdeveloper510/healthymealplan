import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import CurrentCustomerEditor from '../../components/CurrentCustomerEditor/CurrentCustomerEditor';
import Loading from '../../components/Loading/Loading';
import NotFound from '../NotFound/NotFound';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';
import Ingredients from '../../../api/Ingredients/Ingredients';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Discounts from '../../../api/Discounts/Discounts';
import GiftCards from '../../../api/GiftCards/GiftCards';
import Jobs from '../../../api/Jobs/JobsClient';
import Sides from '../../../api/Sides/Sides';

const EditCustomer = ({
  customer,
  history,
  subscription,
  secondaryAccounts,
  popTheSnackbar,
  postalCodes,
  lifestyles,
  restrictions,
  potentialSubIngredients,
  loading,
  discounts,
  jobs,
  giftCards,
  sides,
  deliveryGuys,
}) => (loading ? <Loading /> : customer ? (
  <div className="EditCurrentCustomer">
    <Grid container className="EditCategory SideContent SideContent--spacer-2x--horizontal">
      <CurrentCustomerEditor
        lifestyles={lifestyles}
        restrictions={restrictions}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        postalCodes={postalCodes}
        secondaryAccounts={secondaryAccounts}
        subscription={subscription}
        customer={customer}
        history={history}
        loading={loading}
        discounts={discounts}
        jobs={jobs}
        giftCards={giftCards}
        deliveryGuys={deliveryGuys}
        sides={sides}
      />
    </Grid>
  </div>
) : <NotFound />);

EditCustomer.propTypes = {
  customer: PropTypes.object,
  subscription: PropTypes.object,
  secondaryAccounts: PropTypes.arrayOf(Object).isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  deliveryGuys: PropTypes.array,
  sides: PropTypes.array,

};

export default withTracker(({ match }) => {
  const customerId = match.params._id;
  const subscription = Meteor.subscribe('user.customer.single', customerId);
  const subscription2 = Meteor.subscribe('subscriptions.single', customerId);
  const subscription3 = Meteor.subscribe('user.secondaryAccounts', customerId);
  const subscription4 = Meteor.subscribe('lifestyles');
  const subscription5 = Meteor.subscribe('restrictions');
  const subscription6 = Meteor.subscribe('ingredients');
  const subscription7 = Meteor.subscribe('postalcodes');
  const subscription8 = Meteor.subscribe('discounts');
  const subscription9 = Meteor.subscribe('jobs.subscription', customerId);
  const subscription10 = Meteor.subscribe('giftcards');
  const subscription11 = Meteor.subscribe('users.deliveryGuys');
  const subscription12 = Meteor.subscribe('sides', {}, {});



    return {
    loading: !subscription.ready() && !subscription2.ready() && !subscription3.ready() && !subscription4.ready() && !subscription5.ready()
      && !subscription6.ready() && !subscription7.ready() && !subscription8.ready() && !subscription9.ready() && !subscription10.ready() && !subscription11.ready() && !subscription12.ready(),
    customer: Meteor.users.findOne(customerId),
    subscription: Subscriptions.findOne({ customerId }),
    secondaryAccounts: Meteor.users.find({ secondary: true, primaryAccount: customerId }).fetch(),
    lifestyles: Lifestyles.find().fetch(),
    restrictions: Restrictions.find().fetch(),
    potentialSubIngredients: Ingredients.find().fetch(),
    postalCodes: PostalCodes.find().fetch(),
    discounts: Discounts.find().fetch(),
    jobs: Jobs.find().fetch(),
    giftCards: GiftCards.find().fetch(),
    sides: Sides.find().fetch(),
    deliveryGuys: Meteor.users.find({ roles: ['admin', 'delivery'] }).fetch(),
  };
})(EditCustomer);
