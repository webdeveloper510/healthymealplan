import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Restrictions from '../../../api/Restrictions/Restrictions';

import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import LifestyleEditor from '../../components/LifestyleEditor/LifestyleEditor';

const NewLifestyle = ({ history, newLifestyle, popTheSnackbar, restrictions }) => (
  <div>
    <Grid container className="NewLifestyle SideContent SideContent--spacer-2x--horizontal">
      <LifestyleEditor
        newLifestyle={newLifestyle}
        restrictions={restrictions}
        history={history}
        popTheSnackbar={popTheSnackbar}
      />
    </Grid>
  </div>
);

NewLifestyle.propTypes = {
  history: PropTypes.object.isRequired,
  restrictions: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  newLifestyle: PropTypes.bool.isRequired
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('restrictions');

  return {
    newLifestyle: true,
    loading: !subscription.ready(),
    restrictions: Restrictions.find().fetch(),
  };
}, NewLifestyle);

