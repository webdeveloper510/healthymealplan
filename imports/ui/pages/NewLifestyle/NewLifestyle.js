import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Restrictions from '../../../api/Restrictions/Restrictions';

import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import LifestyleEditor from '../../components/LifestyleEditor/LifestyleEditor';

const NewLifestyle = ({ history, ingredientTypes, potentialSubIngredients, newLifestyle, popTheSnackbar }) => (
  <div>
    <Grid container className="NewLifestyle SideContent SideContent--spacer-2x--horizontal">
      <LifestyleEditor
        history={history}
        potentialSubIngredients={potentialSubIngredients}
        popTheSnackbar={popTheSnackbar}
        newLifestyle={newLifestyle}
        ingredientTypes={ingredientTypes}
      />
    </Grid>
  </div>
);

NewLifestyle.propTypes = {
  history: PropTypes.object.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  ingredientTypes: PropTypes.array.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('restrictions');
  const subscription2 = Meteor.subscribe('ingredientTypes');

  return {
    newLifestyle: true,
    loading: !subscription2.ready() && !subscription.ready(),
    restrictions: Restrictions.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
  };
}, NewLifestyle);

