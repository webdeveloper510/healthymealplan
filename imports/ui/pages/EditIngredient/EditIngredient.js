import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Ingredients from '../../../api/Ingredients/Ingredients';
import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';
import NotFound from '../NotFound/NotFound';

const EditIngredient = ({ ingredient, history }) => (ingredient ? (
  <div className="EditIngredient">
    <h4 className="page-header">{`Editing "${ingredient.title}"`}</h4>
    <IngredientEditor ingredient={ingredient} history={history} />
  </div>
) : <NotFound />);

EditIngredient.defaultProps = {
  ingredient: null,
};

EditIngredient.propTypes = {
  ingredient: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const ingredientId = match.params._id;
  const subscription = Meteor.subscribe('ingredients.view', ingredientId);

  return {
    loading: !subscription.ready(),
    doc: Ingredients.findOne(ingredientId),
  };
}, EditIngredient);
