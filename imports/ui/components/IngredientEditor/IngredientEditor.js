/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import Button from 'material-ui/Button';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

class IngredientEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        title: {
          required: true,
        },

      },
      messages: {
        title: {
          required: 'Need a title in here, Seuss.',
        },

      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingIngredient = this.props.ingredient && this.props.ingredient._id;
    const methodToCall = existingIngredient ? 'ingredients.update' : 'ingredients.insert';
    const doc = {
      title: this.title.value.trim(),
      // body: this.body.value.trim(),
    };

    if (existingIngredient) doc._id = existingIngredient;

    Meteor.call(methodToCall, doc, (error, ingredientId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingIngredient ? 'Ingredient updated!' : 'Ingredient added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/ingredients/${ingredientId}`);
      }
    });
  }

  render() {
    const { ingredient } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="title"
            ref={title => (this.title = title)}
            defaultValue={ingredient && ingredient.title}
            placeholder="Oh, The Places You'll Go!"
          />
        </FormGroup>

        <Button type="submit" raised>
          {ingredient && ingredient._id ? 'Save Changes' : 'Add Ingredient'}
        </Button>
      </form>);
  }
}

IngredientEditor.defaultProps = {
  ingredient: { title: '' },
};

IngredientEditor.propTypes = {
  ingredient: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default IngredientEditor;
