import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import GiftCards from '../../../api/GiftCards/GiftCards';

import GiftCardEditor from '../../components/GiftCardEditor/GiftCardEditor';
import Loading from '../../components/Loading/Loading';

import NotFound from '../NotFound/NotFound';

const EditGiftCard = ({ history, popTheSnackbar, customers, loading, giftCard }) => (loading ? <Loading /> : giftCard ? (
  <div>
    <Grid container className="EditGiftCard SideContent SideContent--spacer-2x--horizontal">
      <GiftCardEditor
        giftCard={giftCard}
        popTheSnackbar={popTheSnackbar}
        customers={customers}
        history={history}
        newGiftCard={false}
        loading={loading}
      />
    </Grid>
  </div>
) : <NotFound />);

EditGiftCard.propTypes = {
  giftCard: PropTypes.object,
  history: PropTypes.object.isRequired,
  customers: PropTypes.array.isRequried,
  loading: PropTypes.bool.isRequired,
};

export default withTracker(({ match }) => {
  const giftCardId = match.params._id;
  const subscription = Meteor.subscribe('giftcards.view', giftCardId);
  const subscription1 = Meteor.subscribe('users.customers.primary');

  return {
    loading: !subscription.ready() && !subscription1.ready(),
    giftCard: GiftCards.findOne(giftCardId),
    customers: Meteor.users.find({ roles: ['customer'] }).fetch(),
  };
})(EditGiftCard);
