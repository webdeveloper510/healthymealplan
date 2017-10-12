import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import Search from 'material-ui-icons/Search';
import Input, { InputLabel } from 'material-ui/Input';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Paper from 'material-ui/Paper';

const styles = theme => ({


});

export default class SubIngredientsAutoComplete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
    };
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


  onSuggestionSelected(event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) {
    const clonedSubIngredients = this.state.subIngredients ? this.state.subIngredients.slice() : [];

    console.log(suggestion);
    let isThere = false;

    if (clonedSubIngredients.length > 0) {
      isThere = clonedSubIngredients.filter(present => suggestion._id === present._id);
    }

    if (isThere != false) {
      return;
    }

    clonedSubIngredients.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      subIngredients: clonedSubIngredients,
    });
  }

  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  // Use your imagination to render suggestions.
  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
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


  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
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


  render() {
    return (
      <div>
        <Search className="autoinput-icon" />
        <Autosuggest
          className="autosuggest"
          theme={{
            container: {
              flexGrow: 1,
              position: 'relative',
              marginBottom: '2em',
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
            placeholder: 'Search',
            value: this.state.value,
            onChange: this.onChange.bind(this),
            className: 'autoinput',
          }}
        />
      </div>
    );
  }
}
