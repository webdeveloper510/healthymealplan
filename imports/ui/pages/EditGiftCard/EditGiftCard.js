import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import GiftCards from '../../../api/GiftCards/GiftCards';

import GiftCardEditor from '../../components/GiftCardEditor/GiftCardEditor';

import NotFound from '../NotFound/NotFound';

const EditGiftCard = ({ discount, history, popTheSnackbar, newGiftCard, customers, loading }) => (giftCard ? (
  <div>
    <Grid container className="EditGiftCard SideContent SideContent--spacer-2x--horizontal">
      <GiftCardEditor
        giftCard={giftCard}
        popTheSnackbar={popTheSnackbar}
        customers={customers}
        history={history}
        newGiftCard={newGiftCard}
        loading={loading}
      />
    </Grid>
  </div>
) : <NotFound />);

EditGiftCard.defaultProps = {
  giftCard: null,
  newGiftCard: false,
};

EditGiftCard.propTypes = {
  giftCard: PropTypes.object,
  history: PropTypes.object.isRequired,
  newGiftCard: PropTypes.bool.isRequired,
  customers: PropTypes.array.isRequried,
};

export default withTracker(({ match }) => {
  const giftCardId = match.params._id;
  const subscription = Meteor.subscribe('giftcards.view', giftCardId);
  const subscription1 = Meteor.subscribe('users.customers.primary');

  return {
    newGiftCard: false,
    loading: !subscription.ready() && !subscription1.ready(),
    giftCard: GiftCards.findOne(giftCardId),
    customers: Meteor.users.find({ roles: ['customer'] }).fetch(),
  };
})(EditGiftCard);
