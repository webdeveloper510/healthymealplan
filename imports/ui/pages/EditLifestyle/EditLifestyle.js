import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';

import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';

import LifestyleEditor from '../../components/LifestyleEditor/LifestyleEditor';

import NotFound from '../NotFound/NotFound';

const EditLifestyle = ({ lifestyle, history, restrictions, ingredientTypes, popTheSnackbar, newLifestyle }) => (lifestyle ? (
  <div>
    <Grid container className="EditLifestyle SideContent SideContent--spacer-2x--horizontal">
      <LifestyleEditor
        lifestyle={lifestyle}
        restrictions={restrictions}
        potentialSubIngredients={[]}
        popTheSnackbar={popTheSnackbar}
        ingredientTypes={ingredientTypes}
        history={history}
        newLifestyle={newLifestyle}
      />
    </Grid>
  </div>
) : <NotFound />);

EditLifestyle.defaultProps = {
  lifestyle: null,
  newLifestyle: false,
};

EditLifestyle.propTypes = {
  lifestyle: PropTypes.object,
  history: PropTypes.object.isRequired,
  newLifestyle: PropTypes.bool.isRequired,
  // popTheSnackbar: PropTypes.func.isRequired,
  restrictions: PropTypes.array.requried
};

export default createContainer(({ match }) => {
  const lifestyleId = match.params._id;
  const subscription = Meteor.subscribe('lifestyles.view', lifestyleId);
  const subscription2 = Meteor.subscribe('restrictions');
  
  // let categorySubReady = new ReactiveVar(false);


  return {
    newLifestyle: false,
    loading: !subscription.ready() && !subscription2.ready(),
    lifestyle: Lifestyles.findOne(lifestyleId),
    restrictions: Restrictions.find().fetch(),
  };
}, EditLifestyle);
