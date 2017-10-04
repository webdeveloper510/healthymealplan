/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Chip from 'material-ui/Chip';

import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

class TypeEditor extends React.Component {
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
    const existingIngredientType = this.props.ingredientType && this.props.ingredientType._id;
    const methodToCall = existingIngredientType ? 'ingredientTypes.update' : 'ingredientTypes.insert';
    const ingredientType = {
      title: this.title.value.trim(),
    };

    if (existingIngredientType) ingredientType._id = existingIngredientType;

    Meteor.call(methodToCall, ingredientType, (error, ingredientType) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingIngredientType ? 'Type updated!' : 'Type added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/types/${ingredientType}`);
      }
    });
  }

  render() {
    const { ingredientType } = this.props;
    return (
      <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Title</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="title"
            ref={title => (this.title = title)}
            defaultValue={ingredientType && ingredientType.title}
            placeholder="Oh, The Places You'll Go!"
          />
          <TextField
            id="name"
            label="Name"
            margin="normal"
          />
        </FormGroup>

        <Button type="submit" raised>
          {ingredientType && ingredientType._id ? 'Save Changes' : 'Add Type'}
        </Button>
      </form>);
  }
}

TypeEditor.defaultProps = {
  ingredientType: { title: '' },
};

TypeEditor.propTypes = {
  ingredientType: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default TypeEditor;
