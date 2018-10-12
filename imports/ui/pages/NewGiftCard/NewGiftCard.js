import React from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import GiftCardEditor from '../../components/GiftCardEditor/GiftCardEditor';

const NewGiftCard = ({ history, newGiftCard, popTheSnackbar, customers }) => (
  <div>
    <Grid container className="NewGiftCard SideContent SideContent--spacer-2x--horizontal">
      <GiftCardEditor
        newGiftCard={newGiftCard}
        customers={customers}
        history={history}
        popTheSnackbar={popTheSnackbar}
      />
    </Grid>
  </div>
);

NewGiftCard.propTypes = {
  history: PropTypes.object.isRequired,
  customers: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newGiftCard: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.customers.primary');

  return {
    newGiftCard: true,
    loading: !subscription.ready(),
    customers: Meteor.users.find({ roles: ["customer"] }).fetch(),
  };
})(NewGiftCard);

