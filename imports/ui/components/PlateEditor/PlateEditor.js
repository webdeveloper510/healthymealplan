/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';

import Autosuggest from 'react-autosuggest';

import _ from 'lodash';

import { Meteor } from 'meteor/meteor';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';

import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from 'material-ui/Table';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

import Chip from 'material-ui/Chip';
import Paper from 'material-ui/Paper';

import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import $ from 'jquery';

import { red } from 'material-ui/colors';
import ChevronLeft from 'material-ui-icons/ChevronLeft';

import Search from 'material-ui-icons/Search';
import Loading from '../Loading/Loading';

import validate from '../../../modules/validate';
import PlateImages from '../../../api/PlateImages/PlateImages';

const danger = red[700];

const styles = theme => ({});

class PlateEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plateImageSrc:
        this.props.newPlate == false &&
          this.props.document &&
          this.props.document.imageUrl
          ? this.props.document.imageUrl
          : '',
      value: '', // Autosuggest
      valueMealType: this.props.plate ? this.props.plate.mealType : 'Breakfast',
      valueInstructionActual: 'None',
      suggestions: [],
      subIngredients:
        this.props.plate && this.props.plate.ingredients
          ? _.sortBy(this.props.plate.ingredients, 'title')
          : [],
      instructions: this.props.instructions || [],
      custom:
        this.props.plate && !this.props.newPlate
          ? this.props.plate.custom
          : false,

      deleteDialogOpen: false,
      hasFormChanged: false,
      imageFieldChanged: false,
    };

    this.renderImageUrl = this.renderImageUrl.bind(this);
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      errorPlacement(error, element) {
        error.insertAfter(
          $(element)
            .parent()
            .parent(),
        );
      },

      rules: {
        title: {
          required: true,
        },

        subtitle: {
          required: true,
        },

        // plateImage: {
        //   required: true,
        // },

        type: {
          required: true,
        },

        instructionId: {
          required: true,
        },
      },
      messages: {
        title: {
          required: 'Name required.',
        },
      },
      submitHandler() {
        component.handleSubmit();
      },
    });
  }

  /* Dialog box controls */
  deleteDialogHandleClickOpen() {
    this.setState({ deleteDialogOpen: true });
  }

  deleteDialogHandleRequestClose() {
    this.setState({ deleteDialogOpen: false });
  }

  // Use your imagination to render suggestions.
  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onFileLoad(e) {
    // console.log(e.target.files[0]);


    const reader = new FileReader();
    const file = e.target.files[0];

    reader.addEventListener('load', () => {
      this.setState({
        plateImageSrc: reader.result,
        imageFieldChanged: true,
        hasFormChanged: true,
      });
    })

    if (file) {
      reader.readAsDataURL(file);
    }
  }

  onSuggestionSelected(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    const clonedSubIngredients = this.state.subIngredients
      ? this.state.subIngredients.slice()
      : [];

    let isThere = false;

    if (clonedSubIngredients.length > 0) {
      isThere = clonedSubIngredients.filter(
        present => suggestion._id === present._id,
      );
    }

    if (isThere != false) {
      return;
    }

    clonedSubIngredients.push({ _id: suggestion._id, title: suggestion.title });

    this.setState({
      subIngredients: clonedSubIngredients,
      hasFormChanged: true,
    });
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

    return inputLength === 0
      ? []
      : this.props.potentialSubIngredients.filter(
        ingredient =>
          ingredient.title.toLowerCase().slice(0, inputLength) === inputValue,
      );
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.title;
  }

  handleRemoveActual() {
    const { popTheSnackbar, history, plate } = this.props;

    const existingPlate = plate && plate._id;
    localStorage.setItem('plateDeleted', plate.title);
    const plateDeletedMessage = `${localStorage.getItem(
      'plateDeleted',
    )} deleted from main courses.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('plates.remove', existingPlate, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: plateDeletedMessage,
        });

        history.push('/plates');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmit() {
    console.log('handling submit');

    const { history, popTheSnackbar } = this.props;
    const existingPlate = this.props.plate && this.props.plate._id;
    const methodToCall = existingPlate ? 'plates.update' : 'plates.insert';

    const plate = {
      title: document.querySelector('#title').value.trim(),
      subtitle: document.querySelector('#subtitle').value.trim(),
      mealType: this.state.valueMealType.trim(),
      ingredients: this.state.subIngredients || [],
      custom: this.state.custom,
      nutritional: {
        regular: {
          fat: $("[name='regular_fat']").val(),
          calories: $('[name="regular_calories"]').val(),
          proteins: $('[name="regular_proteins"]').val(),
          carbs: $('[name="regular_carbs"]').val(),
        },
        athletic: {
          calories: $('[name="athletic_calories"]').val(),
          proteins: $('[name="athletic_proteins"]').val(),
          carbs: $('[name="athletic_carbs"]').val(),
          fat: $('[name="athletic_fat"]').val(),
        },
        bodybuilder: {
          calories: $('[name="bodybuilder_calories"]').val(),
          proteins: $('[name="bodybuilder_proteins"]').val(),
          carbs: $('[name="bodybuilder_carbs"]').val(),
          fat: $('[name="bodybuilder_fat"]').val(),
        },
      },
    };

    if (this.state.valueInstructionActual !== 'None') {
      const selectedInstruction = this.props.instructions.filter((e, i) => {
        if (this.state.valueInstructionActual === e.title) {
          return e._id;
        }
      });

      plate.instructionId = selectedInstruction[0]._id;
    }

    if (existingPlate) plate._id = existingPlate;

    console.log(plate);

    Meteor.call(methodToCall, plate, (error, plateId) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        localStorage.setItem(
          'plateForSnackbar',
          plate.title || $('[name="title"]').val(),
        );

        const confirmation = existingPlate
          ? `${localStorage.getItem('plateForSnackbar')} main course updated.`
          : `${localStorage.getItem('plateForSnackbar')} main course added.`;

        // if (this.state.imageFieldChanged) {
        //   S3.upload({
        //     file: document.getElementById('plateImage').files[0],
        //     path: 'images',
        //   }, (err, res) => {
        //     console.log('Err');
        //     console.log(err);
        //     console.log('Res');
        //     console.log(res);

        //     Meteor.call(
        //       'plates.updateImageUrl',
        //       {
        //         _id: plateId,
        //         imageUrl: res.relative_url,
        //       },
        //       (err, plateId) => {
        //         if (err) {
        //           console.log(err);
        //         } else {
        //           this.props.popTheSnackbar({
        //             message: confirmation,
        //             buttonText: 'View',
        //             buttonLink: `/plates/${plateId}/edit`,
        //           });

        //           this.props.history.push('/plates');
        //         }
        //       },
        //     );
        //   });
        // } else {
        this.props.popTheSnackbar({
          message: confirmation,
          buttonText: 'View',
          buttonLink: `/plates/${plateId}/edit`,
        });

        this.props.history.push('/plates');
        // }
      }
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog
        open={this.state.deleteDialogOpen}
        onClose={this.deleteDialogHandleRequestClose.bind(this)}
      >
        <Typography
          style={{
            flex: '0 0 auto',
            margin: '0',
            padding: '24px 24px 20px 24px',
          }}
          className="title font-medium"
          type="title"
        >
          Delete {this.props.plate ? this.props.plate.title.toLowerCase() : ''}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{' '}
            {this.props.plate ? this.props.plate.title.toLowerCase() : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.deleteDialogHandleRequestClose.bind(this)}
            color="default"
          >
            Cancel
          </Button>
          <Button
            stroked
            className="button--bordered button--bordered--accent"
            onClick={this.handleRemoveActual.bind(this)}
            color="accent"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderSuggestion(suggestion) {
    return (
      <MenuItem component="div">
        <div>{suggestion.title}</div>
      </MenuItem>
    );
  }

  renderInput(inputProps) {
    const { value, ...other } = inputProps;

    return (
      <TextField
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

  handleSubIngredientChipDelete(subIngredient) {
    console.log(subIngredient);

    const stateCopy = this.state.subIngredients.slice();

    stateCopy.splice(stateCopy.indexOf(subIngredient), 1);

    this.setState({
      subIngredients: stateCopy,
      hasFormChanged: true,
    });
  }

  getSubIngredientTitle(subIngredient) {
    // console.log(subIngredient);

    if (subIngredient.title) {
      return subIngredient.title;
    }

    if (this.props.allIngredients) {
      return this.props.allIngredients.find(el => el._id === subIngredient);
    }
  }

  getSubIngredientAvatar(subIngredient) {
    if (subIngredient.title) {
      return subIngredient.title.charAt(0);
    }

    if (this.props.allIngredients) {
      const avatarToReturn = this.props.allIngredients.find(
        el => el._id === subIngredient,
      );
      return avatarToReturn.title.charAt(0);
    }
  }

  titleFieldChanged(e) {
    // console.log(e.currentTarget.value.length);

    const hasFormChanged = e.currentTarget.value.length > 0;

    this.setState({
      hasFormChanged,
    });
  }

  changeTableField() {
    this.setState({
      hasFormChanged: true,
    });
  }

  handleMealTypeChange(event, value) {
    this.setState({
      valueMealType: event.target.value,
      hasFormChanged: true,
    });
  }

  handleInstructionChange(event, value) {
    this.setState({
      valueInstructionActual: event.target.value,
      hasFormChanged: true,
    });
  }

  renderImageUrl() {
    if (this.props.newPlate || this.state.imageFieldChanged) {
      return this.state.plateImageSrc;
    } else if (this.props.document && this.props.document.imageUrl) {
      return `${Meteor.settings.public.S3BucketDomain}${this.state.plateImageSrc}`;
    }

    return '';
  }

  render() {
    const { plate, history, loading } = this.props;

    return !loading ? (
      <form
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/plates')}
              className="button button-secondary button-secondary--top"
            >
              <Typography
                type="subheading"
                className="subheading font-medium"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
              >
                <ChevronLeft style={{ marginRight: '4px' }} /> Mains
              </Typography>
            </Button>
          </Grid>
        </Grid>

        <Grid container style={{ marginBottom: '50px' }}>
          <Grid item xs={4}>
            <Typography
              type="headline"
              className="headline"
              style={{ fontWeight: 500 }}
            >
              {plate && plate._id ? `${plate.title}` : 'Add main'}
            </Typography>

            {this.props.plate ? (
              <Typography
                type="body1"
                style={{ color: 'rgba(0, 0, 0, 0.54)' }}
                className="body1"
              >
                {' '}
                SKU {plate.SKU ? plate.SKU : ''}{' '}
              </Typography>
            ) : (
                ''
              )}
          </Grid>
          <Grid item xs={8}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                style={{ marginRight: '10px' }}
                onClick={() => history.push('/plates')}
              >
                Cancel
              </Button>
              <Button
                disabled={!this.state.hasFormChanged || !this.state.imageFieldChanged}
                className="btn btn-primary"
                raised
                type="submit"
                color="contrast"
              >
                Save
              </Button>
            </div>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Main
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    id="title"
                    label="Name"
                    name="title"
                    margin="normal"
                    fullWidth
                    defaultValue={plate && plate.title}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />

                  <TextField
                    margin="normal"
                    id="subtitle"
                    label="Subtitle"
                    name="subtitle"
                    fullWidth
                    defaultValue={plate && plate.subtitle}
                    ref={title => (this.title = title)}
                    inputProps={{}}
                    onChange={this.titleFieldChanged.bind(this)}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Meal type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    fullWidth
                    id="select-meal-type"
                    select
                    value={
                      this.state.valueMealType ? this.state.valueMealType : ''
                    }
                    label="Select a meal type"
                    onChange={this.handleMealTypeChange.bind(this)}
                    SelectProps={{ native: false }}
                    name="type"
                  >
                    <MenuItem key={2} value="Breakfast">
                      Breakfast
                    </MenuItem>
                    <MenuItem key={3} value="Lunch">
                      Lunch
                    </MenuItem>
                    <MenuItem key={4} value="Dinner">
                      Dinner
                    </MenuItem>
                  </TextField>

                  <FormControlLabel
                    style={{ marginTop: '1em' }}
                    control={
                      <Checkbox
                        checked={this.state.custom}
                        onChange={(event, checked) => {
                          this.setState({
                            custom: checked,
                            hasFormChanged: true,
                          });
                        }}
                        value="checked"
                      />
                    }
                    label="Custom"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Image
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <input
                    type="file"
                    id="plateImage"
                    name="plateImage"
                    onChange={this.onFileLoad.bind(this)}
                  />
                  <img
                    style={{ marginTop: '50px', display: 'block' }}
                    src={this.renderImageUrl()}
                    style={{ maxWidth: '100%' }}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: '75px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Ingredients
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Search className="autoinput-icon" />
                  <Autosuggest
                    id="2"
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
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(
                      this,
                    )}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(
                      this,
                    )}
                    onSuggestionSelected={this.onSuggestionSelected.bind(this)}
                    getSuggestionValue={this.getSuggestionValue.bind(this)}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    renderSuggestionsContainer={this.renderSuggestionsContainer.bind(
                      this,
                    )}
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: 'Search',
                      value: this.state.value,
                      onChange: this.onChange.bind(this),
                      className: 'autoinput',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {this.state.subIngredients ? (
                      this.state.subIngredients.map((subIngredient, i) => (
                        <Chip
                          avatar={
                            <Avatar>
                              {' '}
                              {this.getSubIngredientAvatar(subIngredient)}{' '}
                            </Avatar>
                          }
                          style={{ marginRight: '8px', marginBottom: '8px' }}
                          label={this.getSubIngredientTitle(subIngredient)}
                          key={i}
                          onDelete={this.handleSubIngredientChipDelete.bind(
                            this,
                            subIngredient,
                          )}
                        />
                      ))
                    ) : (
                        <Chip className="chip--bordered" label="Sub-ingredient" />
                      )}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Instructions
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <TextField
                    fullWidth
                    id="select-instruction"
                    select
                    onChange={this.handleInstructionChange.bind(this)}
                    SelectProps={{ native: true }}
                    name="instruction"
                  >
                    <option
                      selected={
                        !!(
                          !this.props.newPlate &&
                          !this.props.plate.instructionId
                        )
                      }
                    >
                      None
                    </option>
                    {this.props.instructions.map((e, i) => (
                      <option
                        selected={
                          !this.props.newPlate
                            ? e._id === this.props.plate.instructionId
                            : ''
                        }
                        key={i + 2}
                        value={e.title}
                      >
                        {e.title}
                      </option>
                    ))}
                  </TextField>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider light className="divider--space-x" />

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Nutritional Facts
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Table className="table-lifestyles">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell style={{ textAlign: 'center' }}>
                          <Typography
                            type="subheading"
                            className="font-medium font-uppercase"
                          >
                            Calories
                          </Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <Typography
                            type="subheading"
                            className="font-medium font-uppercase"
                          >
                            Proteins
                          </Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <Typography
                            type="subheading"
                            className="font-medium font-uppercase"
                          >
                            Carbs
                          </Typography>
                        </TableCell>
                        <TableCell style={{ textAlign: 'center' }}>
                          <Typography
                            type="subheading"
                            className="font-medium font-uppercase"
                          >
                            Fat
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Typography
                            type="subheading"
                            style={{ marginTop: '10px' }}
                          >
                            Regular
                          </Typography>
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.regular.calories
                                ? this.props.plate.nutritional.regular.calories
                                : '0'
                            }
                            name="regular_calories"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.regular.proteins
                                ? this.props.plate.nutritional.regular.proteins
                                : '0'
                            }
                            name="regular_proteins"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.regular.carbs
                                ? this.props.plate.nutritional.regular.carbs
                                : '0'
                            }
                            name="regular_carbs"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.regular.fat
                                ? this.props.plate.nutritional.regular.fat
                                : '0'
                            }
                            name="regular_fat"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography
                            type="subheading"
                            style={{ marginTop: '10px' }}
                          >
                            Athletic
                          </Typography>
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.athletic.calories
                                ? this.props.plate.nutritional.athletic.calories
                                : '0'
                            }
                            name="athletic_calories"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.athletic.proteins
                                ? this.props.plate.nutritional.athletic.proteins
                                : '0'
                            }
                            name="athletic_proteins"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.athletic.carbs
                                ? this.props.plate.nutritional.athletic.carbs
                                : '0'
                            }
                            name="athletic_carbs"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.athletic.fat
                                ? this.props.plate.nutritional.athletic.fat
                                : '0'
                            }
                            name="athletic_fat"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Typography
                            type="subheading"
                            style={{ marginTop: '10px' }}
                          >
                            Bodybuilder
                          </Typography>
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.bodybuilder.calories
                                ? this.props.plate.nutritional.bodybuilder
                                  .calories
                                : '0'
                            }
                            name="bodybuilder_calories"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.bodybuilder.proteins
                                ? this.props.plate.nutritional.bodybuilder
                                  .proteins
                                : '0'
                            }
                            name="bodybuilder_proteins"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.bodybuilder.carbs
                                ? this.props.plate.nutritional.bodybuilder.carbs
                                : '0'
                            }
                            name="bodybuilder_carbs"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>

                        <TableCell style={{ textAlign: 'center' }}>
                          <TextField
                            fullWidth
                            margin="normal"
                            style={{
                              fontSize: '1rem',
                              maxWidth: '100px',
                              minWidth: '100px',
                              textAlign: 'center',
                            }}
                            inputProps={{ type: 'number' }}
                            defaultValue={
                              this.props.plate &&
                                this.props.plate.nutritional &&
                                this.props.plate.nutritional.bodybuilder.fat
                                ? this.props.plate.nutritional.bodybuilder.fat
                                : '0'
                            }
                            name="bodybuilder_fat"
                            onChange={this.changeTableField.bind(this)}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {this.props.newPlate ? (
                  ''
                ) : (
                    <Button
                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                      raised
                      onClick={
                        plate && plate._id
                          ? this.handleRemove.bind(this)
                          : () => this.props.history.push('/plates')
                      }
                    >
                      Delete
                  </Button>
                  )}
              </Grid>

              <Grid item xs={8}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    style={{ marginRight: '10px' }}
                    onClick={() => history.push('/plates')}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!this.state.hasFormChanged}
                    type="submit"
                    className="btn btn-primary"
                    raised
                    color="contrast"
                  >
                    Save
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {this.renderDeleteDialog()}
      </form>
    ) : (
        <Loading />
      );
  }
}

PlateEditor.propTypes = {
  plate: PropTypes.object.isRequired,
  instructions: PropTypes.array.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  document: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default PlateEditor;
