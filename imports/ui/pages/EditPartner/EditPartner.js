import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import PartnerEditor from '../../components/PartnerEditor/PartnerEditor';
import Loading from '../../components/Loading/Loading';
import NotFound from '../NotFound/NotFound';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Discounts from '../../../api/Discounts/Discounts';

const EditPartner = ({
   history,
   popTheSnackbar,
   partner,
  subscription,
  discounts,
  loading,
}) => (loading ? <Loading /> : partner ? (
  <div className="EditCurrentCustomer">
    <Grid container className="EditCategory SideContent SideContent--spacer-2x--horizontal">
      <PartnerEditor
          loading={loading}
          history={history}
          popTheSnackbar={popTheSnackbar}
          partner={partner}
          subscription={subscription}
          newPartner={false}
          discounts={discounts}
      />
    </Grid>
  </div>
) : <NotFound />);

EditPartner.propTypes = {
  partner: PropTypes.object,
  subscription: PropTypes.object,
  secondaryAccounts: PropTypes.arrayOf(Object).isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

EditPartner.defaultProps = {
    history: PropTypes.object.isRequired,
    popTheSnackbar: PropTypes.func.isRequired,
};

export default withTracker(({ match }) => {

    const partnerId = match.params._id
    console.log(partnerId)
    const subscription = Meteor.subscribe('subscriptions.single', partnerId);
    const subscription2 = Meteor.subscribe('user.partner.single', partnerId);
    const subscription3 = Meteor.subscribe('discounts');

    return {
      loading:
      !subscription.ready() &&
      !subscription2.ready() &&
       !subscription3.ready(),
      subscription: Subscriptions.findOne({ customerId: partnerId }),
      partner: Meteor.users.findOne({ _id: partnerId }),
        discounts: Discounts.find().fetch(),

    };
})(EditPartner);
