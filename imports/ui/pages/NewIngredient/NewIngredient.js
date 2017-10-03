import React from 'react';
import PropTypes from 'prop-types';
import IngredientEditor from '../../components/IngredientEditor/IngredientEditor';

const NewIngredient = ({ history }) => (
  <div className="NewIngredient">
    <h4 className="page-header">New Ingredient</h4>
    <IngredientEditor history={history} />
  </div>
);

NewIngredient.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewIngredient;
