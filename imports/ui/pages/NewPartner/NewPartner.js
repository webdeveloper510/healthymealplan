import React from 'react';
import PropTypes from 'prop-types';

import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

import Grid from 'material-ui/Grid';
import Ingredients from '../../../api/Ingredients/Ingredients';
import IngredientTypes from '../../../api/IngredientTypes/IngredientTypes';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Restrictions from '../../../api/Restrictions/Restrictions';
import PostalCodes from '../../../api/PostalCodes/PostalCodes';
import Sides from '../../../api/Sides/Sides';
import Discounts from '../../../api/Discounts/Discounts';

import PartnerEditor from '../../components/PartnerEditor/PartnerEditor';

const NewPartner = ({
  history,
  ingredientTypes,
  ingredients,
  newCategory,
  popTheSnackbar,
  lifestyles,
  restrictions,
  postalCodes,
  abandoned,
  abandonedCustomer,
  sides,
  discounts,
}) => (
    <div>
      <Grid
        container
        className="NewPartner SideContent SideContent--spacer-2x--horizontal"
      >
        <PartnerEditor
          ingredientTypes={ingredientTypes}
          potentialSubIngredients={ingredients}
          history={history}
          popTheSnackbar={popTheSnackbar}
          newCategory={newCategory}
          lifestyles={lifestyles}
          restrictions={restrictions}
          postalCodes={postalCodes}
          abandonedCustomer={abandonedCustomer}
          abandoned={abandoned}
          sides={sides}
          discounts={discounts}
          newPartner={true}
        />
      </Grid>
    </div>
  );

NewPartner.propTypes = {
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default createContainer(({ match }) => {

  const customerId = match.params._id;

  const subscription = Meteor.subscribe('ingredients');
  const subscription2 = Meteor.subscribe('ingredientTypes');
  const subscription3 = Meteor.subscribe('lifestyles');
  const subscription4 = Meteor.subscribe('restrictions');
  const subscription5 = Meteor.subscribe('postalcodes');
  const subscription6 = Meteor.subscribe('user.customer.single', customerId);
  const subscription7 = Meteor.subscribe('sides', {}, {});
  const subscription8 = Meteor.subscribe('discounts');

  return {
    loading:
      !subscription2.ready() &&
      !subscription.ready() &&
      !subscription3.ready() &&
      !subscription4.ready() &&
      !subscription5.ready() &&
      !subscription6.ready() &&
      !subscription7.ready() &&
      !subscription8.ready(),
    ingredients: Ingredients.find().fetch(),
    ingredientTypes: IngredientTypes.find().fetch(),
    lifestyles: Lifestyles.find().fetch(),
    restrictions: Restrictions.find().fetch(),
    postalCodes: PostalCodes.find().fetch(),
    sides: Sides.find().fetch(),
    discounts: Discounts.find().fetch(),
    abandonedCustomer: Meteor.users.find({ _id: customerId }).fetch(),
    abandoned: customerId ? true : false,
  };
}, NewPartner);
