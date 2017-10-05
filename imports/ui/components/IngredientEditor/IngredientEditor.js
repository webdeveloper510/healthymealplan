/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Autosuggest from 'react-autosuggest';


import { Meteor } from 'meteor/meteor';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import { teal, red } from 'material-ui/colors';
import ArrowBack from 'material-ui-icons/ArrowBack';

import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

const primary = teal[500];
const danger = red[700];

const styles = theme => ({


});


class IngredientEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
    };
  }

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


  // Use your imagination to render suggestions.


  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    console.log(suggestion);
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.potentialSubIngredients.filter(ingredient =>
      ingredient.title.toLowerCase().slice(0, inputLength) === inputValue,
    );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  handleRemove() {
    const existingIngredient = this.props.ingredient && this.props.ingredient._id;

    if (confirm('Are you sure? This is permanent!')) {
      Meteor.call('ingredients.remove', existingIngredient, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Ingredient deleted!', 'success');
        }
      });
    }
  }

  handleSubmit() {
    const { history } = this.props;
    const existingIngredient = this.props.ingredient && this.props.ingredient._id;
    const methodToCall = existingIngredient ? 'ingredients.update' : 'ingredients.insert';

    const ingredient = {
      title: document.querySelector('#title').value.trim(),
      // body: this.body.value.trim(),
    };

    if (existingIngredient) ingredient._id = existingIngredient;

    Meteor.call(methodToCall, ingredient, (error, ingredientId) => {
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

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderInput(inputProps) {
    const { autoFocus, value, ...other } = inputProps;

    return (
      <TextField
        autoFocus={autoFocus}
        className={styles.textField}
        value={value}
        style={{ width: '100%' }}
        InputProps={{
          classes: {
            input: styles.input,
          },
          ...other,
        }}
      />
    );
  }

  renderSuggestionsContainer(options) {
    const { containerProps, children } = options;

    return (
      <Paper {...containerProps} square>
        {children}
      </Paper>
    );
  }

  render() {
    const { ingredient } = this.props;
    console.log(this.props.potentialSubIngredients);
    console.log(this.state.suggestions);

    return (
      <form style={{ width: '100%' }} ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={6}>
                <Typography type="subheading">{ingredient && ingredient._id ? ingredient.title : 'Unsaved Ingredient'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button>Cancel</Button>
                  <Button raised style={{ backgroundColor: primary, margin: '1dp' }} color="contrast">Save</Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12}>
                <Link to="/ingredients">
                  <Typography type="subheading" style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}><ArrowBack /> Ingredients</Typography>
                </Link>

                <Typography type="title">{ingredient && ingredient._id ? `Editing ${ingredient.title}` : 'New Ingredient'}</Typography>

              </Grid>

            </Grid>
          </Grid>
        </Grid>


        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Typography type="subheading">
              Ingredient
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="title"
                  label="Enter the name of the ingredient"
                  margin="normal"
                  name="subIngredient"
                  fullWidth
                  defaultValue={ingredient && ingredient.title}
                  ref={title => (this.title = title)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Typography type="subheading">
                Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl>
                  <InputLabel htmlFor="age-simple">Type</InputLabel>
                  <Select
                    value={this.state.types}
                    onChange={this.handleTypeChange('age')}
                    input={<Input id="type" />}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <Typography type="subheading">
                Sub-ingredients
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autosuggest
                  theme={{
                    container: {
                      flexGrow: 1,
                      position: 'relative',
                      height: 200,
                    },
                    suggestionsContainerOpen: {
                      position: 'absolute',
                      left: 0,
                      right: 0,
                    },
                    suggestion: {
                      display: 'block',
                    },
                    suggestionsList: {
                      margin: 0,
                      padding: 0,
                      listStyleType: 'none',
                    },
                  }}
                  renderInputComponent={this.renderInput.bind(this)}
                  suggestions={this.state.suggestions}
                  onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                  onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                  onSuggestionSelected={this.onSuggestionSelected.bind(this)}
                  getSuggestionValue={this.getSuggestionValue.bind(this)}
                  renderSuggestion={this.renderSuggestion.bind(this)}
                  renderSuggestionsContainer={this.renderSuggestionsContainer.bind(this)}

                  focusInputOnSuggestionClick={false}

                  inputProps={{
                    autoFocus: true,
                    placeholder: 'Search an ingredient',
                    value: this.state.value,
                    onChange: this.onChange.bind(this),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>


        <Grid container justify="center">
          <Grid item xs={10}>
            <Grid container>
              <Grid item xs={6}>
                <Button raised onClick={ingredient && ingredient._id ? this.handleRemove.bind(this) : () => history.push('/ingredients')}>
                  Delete
                </Button>
              </Grid>

              <Grid item xs={6}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Button type="submit" raised style={{ backgroundColor: primary, margin: '1dp' }} color="contrast">
                    {ingredient && ingredient._id ? 'Save Changes' : 'Save'}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid></form>);
  }
}

IngredientEditor.defaultProps = {
  ingredient: { title: '' },
};

IngredientEditor.propTypes = {
  ingredient: PropTypes.object,
  potentialSubIngredients: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default IngredientEditor;
