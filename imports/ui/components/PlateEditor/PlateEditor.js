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
import Select from 'material-ui/Select';

import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';

import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Radio, { RadioGroup } from 'material-ui/Radio';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from 'material-ui/Table';

import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import green from 'material-ui/colors/green';

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
import autoBind from 'react-autobind';

import Search from 'material-ui-icons/Search';
import Loading from '../Loading/Loading';

import validate from '../../../modules/validate';

const danger = red[700];

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

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
      plateImageLargeSrc:
        this.props.newPlate == false &&
          this.props.document &&
          this.props.document.largeImageUrl
          ? this.props.document.largeImageUrl
          : '',
      value: '', // Autosuggest
      valuePlate: '', // Autosuggest
      valueMealType: this.props.plate ? this.props.plate.mealType : 'Breakfast',
      valueInstructionActual: 'None',
      valueInstructionSelect: this.props.plate && this.props.plate.hasOwnProperty('instructionId') ? this.props.plate.instructionId : 'None',
      suggestions: [],
      suggestionsPlate: [],
      subIngredients:
        this.props.plate && this.props.plate.ingredients
          ? _.sortBy(this.props.plate.ingredients, 'title')
          : [],
      substitutePlate: this.props.plate && this.props.plate.substitutePlate ? this.props.plate.substitutePlate : '',
      instructions: this.props.instructions || [],
      custom:
        this.props.plate && !this.props.newPlate
          ? this.props.plate.custom
          : false,

      deleteDialogOpen: false,
      hasFormChanged: false,
      imageFieldChanged: false,
      largeImageFieldChanged: false,
      madeBy: this.props.plate && this.props.plate.madeBy ? this.props.plate.madeBy : '',
      mealCategory: this.props.plate && this.props.plate.mealCategory ? this.props.plate.mealCategory : '',
      allergens: this.props.plate && this.props.plate.allergens && this.props.plate.allergens.length > 0 ? this.props.plate.allergens : [],

      generatedTags: this.props.plate && this.props.plate.hasOwnProperty('generatedTags') ? this.props.plate.generatedTags : [],

      submitLoading: false,
      submitSuccess: false,
    };

    autoBind(this);
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

        madeBy: {
          required: true,
        },

        mealCategory: {
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

  handleChange(event) {
    console.log(event.target.name);
    console.log(event.target.value);
    this.setState({
      hasFormChanged: true,
      [event.target.name]: event.target.value,
    });
  }


  handleChangeAllergens(event) {
    console.log(event.target.value);
    const allergensCopy = this.state.allergens.slice();
    const ifPresentIndex = allergensCopy.indexOf(event.target.value);

    if (ifPresentIndex >= 0) {
      allergensCopy.splice(ifPresentIndex, 1);
    } else {
      allergensCopy.push(event.target.value);
    }

    this.setState({
      hasFormChanged: true,
      allergens: allergensCopy,
    });
  }

  // Use your imagination to render suggestions.
  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onChangeSubstitute(event, { newValue }) {
    this.setState({
      valuePlate: newValue,
    });
  }

  onFileLoad(e) {
    console.log(e.currentTarget.id);

    const imageType = e.currentTarget.id;
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.addEventListener('load', () => {
      if (imageType == 'plateImage') {
        this.setState({
          plateImageSrc: reader.result,
          imageFieldChanged: true,
          hasFormChanged: true,
        });
      } else {
        this.setState({
          plateImageLargeSrc: reader.result,
          largeImageFieldChanged: true,
          hasFormChanged: true,
        });
      }
    });

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

  onSuggestionSelectedPlate(
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method },
  ) {
    console.log(suggestion);

    this.setState({
      substitutePlate: { _id: suggestion._id, title: suggestion.title },
      hasFormChanged: true,
      valuePlate: '',
    });
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: this.getSuggestions(value),
    });
  }

  onSuggestionsFetchRequestedPlate({ value }) {
    this.setState({
      suggestionsPlate: this.getSuggestionsPlate(value),
    });
  }
  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  onSuggestionsClearRequestedPlate() {
    this.setState({
      suggestionsPlate: [],
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

  getSuggestionsPlate(value) {
    console.log(this.props.potentialPlates);
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : this.props.potentialPlates.filter(
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

  handleSubmitNew() {
    if ($('#plate-editor').valid()) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    console.log('handling submit');

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });
    
    if(this.state.mealCategory == ""){
      this.props.popTheSnackbar({
          message: 'Meal category is required',
      });
        this.setState({
            submitSuccess: false,
            submitLoading: false,
        });

    } else if(this.state.madeBy == ""){
      this.props.popTheSnackbar({
          message: 'Created by chef is required',
      });
        this.setState({
            submitSuccess: false,
            submitLoading: false,
        });

    }

    const { history, popTheSnackbar } = this.props;
    const existingPlate = this.props.plate && this.props.plate._id;
    const methodToCall = existingPlate ? 'platesUpdate' : 'platesInsert';

    const plate = {
      title: document.querySelector('#title').value.trim(),
      subtitle: document.querySelector('#subtitle').value.trim(),
      description: document.querySelector('#description').value.trim(),
      madeBy: this.state.madeBy,
      mealCategory: this.state.mealCategory,
      allergens: this.state.allergens,
      mealType: this.state.valueMealType.trim(),
      ingredients: this.state.subIngredients.length > 0 ? this.state.subIngredients : [],
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


    if (typeof this.state.substitutePlate === 'object') {
      plate.substitutePlate = this.state.substitutePlate;
    }


    if (this.state.generatedTags.length > 0) {
      plate.generatedTags = this.state.generatedTags;
    }

    if (this.state.valueInstructionSelect) {
      const selectedInstruction = this.props.instructions.filter(e => this.state.valueInstructionSelect == e._id);

      if (selectedInstruction.length > 0) {
        plate.instructionId = selectedInstruction[0]._id;
      }
    }


    if (existingPlate) plate._id = existingPlate;
    console.log('PLATE IS');
    console.log(plate);

    Meteor.call(methodToCall, plate, (error, plateId) => {
      if (error) {
        this.setState({
          submitSuccess: false,
          submitLoading: false,
        });

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

        if (this.state.imageFieldChanged || this.state.largeImageFieldChanged) {
          if (this.state.imageFieldChanged) {
            S3.upload({
              file: document.getElementById('plateImage').files[0],
              path: 'images',
            }, (err, res) => {
              console.log('Err');
              console.log(err);
              console.log('Res');
              console.log(res);

              if (err) {
                this.props.popTheSnackbar({
                  message: 'There was a problem uploading the image.',
                });

                this.setState({
                  submitSuccess: false,
                  submitLoading: false,
                });
              } else {
                Meteor.call(
                  'plates.updateImageUrl',
                  {
                    _id: plateId,
                    imageUrl: res.relative_url,
                    large: false,
                  },
                  (err, plateId) => {
                    if (err) {
                      this.props.popTheSnackbar({
                        message: 'There was a problem updating the image.',
                      });

                      this.setState({
                        submitSuccess: false,
                        submitLoading: false,
                      });
                    }
                  },
                );
              }
            });
          }

          if (this.state.largeImageFieldChanged) {
            S3.upload({
              file: document.getElementById('plateImageLarge').files[0],
              path: 'images',
            }, (err, res) => {
              console.log('Err');
              console.log(err);
              console.log('Res');
              console.log(res);

              if (err) {
                this.props.popTheSnackbar({
                  message: 'There was a problem uploading the large image.',
                });

                this.setState({
                  submitSuccess: false,
                  submitLoading: false,
                });
              } else {
                Meteor.call(
                  'plates.updateImageUrl',
                  {
                    _id: plateId,
                    imageUrl: res.relative_url,
                    large: true,
                  },
                  (err, plateId) => {
                    if (err) {
                      this.props.popTheSnackbar({
                        message: 'There was a problem updating the large image.',
                      });

                      this.setState({
                        submitSuccess: false,
                        submitLoading: false,
                      });
                    }
                  },
                );
              }
            });
          }

          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          this.props.popTheSnackbar({
            message: confirmation,
            buttonText: 'View',
            buttonLink: `/plates/${plateId}/edit`,
          });

          this.props.history.push('/plates');
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          this.props.popTheSnackbar({
            message: confirmation,
            buttonText: 'View',
            buttonLink: `/plates/${plateId}/edit`,
          });

          this.props.history.push('/plates');
        }
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

  handleSubstitutePlateDelete(plate) {
    console.log(plate);

    this.setState({
      substitutePlate: '',
      hasFormChanged: true,
    });
  }

  getSubIngredientTitle(subIngredient) {
    if (subIngredient._id) {
        const ingredient = this.props.potentialSubIngredients.find(el => el._id === subIngredient._id);
        if (ingredient) {
            return ingredient.title;
        }
    }

    if (subIngredient.title) {
        return subIngredient.title;
    }

    if (this.props.potentialSubIngredients) {
      return this.props.potentialSubIngredients.find(el => el._id === subIngredient);
    }
  }

  getSubstitutePlateTitle(substitutePlate) {
      const subPlate = this.props.potentialPlates.find(e => e._id === substitutePlate._id);

      if (subPlate) {
          return subPlate.title;
      }

      return substitutePlate.title;
  }

  getSubIngredientAvatar(subIngredient){

    console.log(subIngredient);

    if (subIngredient._id) {
        const ingredient = this.props.potentialSubIngredients.find(el => el._id === subIngredient._id);
        if (ingredient) {
          return ingredient.title;
        }
    }

    if (subIngredient.title) {
      return subIngredient.title.charAt(0);
    }

    if (this.props.potentialSubIngredients) {
      const avatarToReturn = this.props.potentialSubIngredients.find(
        el => el._id === subIngredient,
      );

      return avatarToReturn.title.charAt(0);
    }
  }

  titleFieldChanged(e) {
    this.setState({
      hasFormChanged: true,
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

  handleInstructionSelect(event, value) {
    this.setState({
      valueInstructionSelect: event.target.value,
      hasFormChanged: true,
    });
  }

  renderImageUrl() {
    if (this.props.newPlate || this.state.largeImageFieldChanged) {
      return this.state.plateImageSrc;
    } else if (this.props.document && this.props.document.imageUrl) {
      return `${Meteor.settings.public.S3BucketDomain}${this.state.plateImageSrc}`;
    }

    return '';
  }

  renderLargeImageUrl() {
    if (this.props.newPlate || this.state.largeImageFieldChanged) {
      return this.state.plateImageLargeSrc;
    } else if (this.props.document && this.props.document.largeImageUrl) {
      return `${Meteor.settings.public.S3BucketDomain}${this.state.plateImageLargeSrc}`;
    }

    return '';
  }

  handleDeleteImage(type) {
    let path = ""
    if (type == 'small') {
      path = this.state.plateImageSrc;
    }

    if (type == 'large') {
     path = this.state.plateImageLargeSrc;
    }

    S3.delete(path, (err, res) => {
      if(err){
        this.props.popTheSnackbar({
          message: 'There was a problem deleting the image.'
        })
      }else{

        if(type == "large"){
          this.setState({plateImageLargeSrc: ''})
        }

        if(type == "small"){
          this.setState({plateImageSrc: ''})
        } 

        const toSend = { _id: this.props.plate._id, large: type == 'large' };

        Meteor.call('plates.deleteImageUrl', toSend, (err, res) => {
          if(err){
            console.log(err);
            this.props.popTheSnackbar({
              message: err.reason || err
            })
          }else{
            this.props.popTheSnackbar({
              message: 'The image reference been removed from the main.'
            })
          }
        })
      }
    })
  }

  generateTags(e) {
    e.preventDefault();

    if (this.state.subIngredients.length == 0) {
      this.props.popTheSnackbar({
        message: 'Please add at least one ingredient to generate tags.',
      });
      return;
    }

    const generatedTags = [];
    let MAX_TAG_LIMIT = 5;

    const ingredientItemTags = this.props.potentialSubIngredients
      .filter(e => this.state.subIngredients.find(el => el._id == e._id) != undefined)
      .map(e => e.tags)
      .filter(e => e !== undefined);

    console.log(ingredientItemTags);

    if (ingredientItemTags.length <= 5) {
      MAX_TAG_LIMIT = ingredientItemTags.length;
    }

    if (ingredientItemTags.length == 0) {
      this.props.popTheSnackbar({
        message: 'Selected ingredients do not have tags. Please verify.',
      });

      return;
    }

    while (generatedTags.length <= MAX_TAG_LIMIT) {
      const randomIngredientIndex = Math.floor(Math.random() * (ingredientItemTags.length - 0)) + 0;
      const randomIngredientTagIndex = Math.floor(Math.random() * (ingredientItemTags[randomIngredientIndex].length - 0)) + 0;

      const itemToPush = ingredientItemTags[randomIngredientIndex][randomIngredientTagIndex];

      if (generatedTags.includes(itemToPush)) {
        continue;
      } else {
        generatedTags.push(itemToPush);
      }
    }
    // ingredientItemTags.forEach((itemTags, itemIndex) => {

    //     const randomIndex = Math.floor(Math.random() * (+itemTags.length - 0)) + 0;

    //   if (generatedTags.length <= MAX_TAG_LIMIT) {
    //     generatedTags.push(itemTags[randomIndex]);
    //   }
    // });

    console.log(generatedTags);

    this.setState({
      generatedTags,
      hasFormChanged: true,
    });
  }

  render() {
    const { plate, history, loading } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return !loading ? (
      <form
        ref={form => (this.form = form)}
        id="plate-editor"
        style={{ width: '100%' }}
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
                disabled={!this.state.hasFormChanged || this.state.submitLoading}
                className="btn btn-primary"
                raised
                type="submit"
                color="contrast"
                onClick={() => this.handleSubmitNew()}
              >
                Save
                {this.state.submitLoading && (
                  <CircularProgress
                    size={24}
                    className={this.props.classes.buttonProgress}
                  />
                )}
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
                    onChange={this.titleFieldChanged.bind(this)}
                  />

                  <TextField
                    margin="normal"
                    id="description"
                    label="Description"
                    name="description"
                    fullWidth
                    defaultValue={plate && plate.description}
                    multiline
                    onChange={this.titleFieldChanged.bind(this)}
                  />

                  <Grid container style={{ marginTop: '25px' }}>
                    <Grid item xs={12}>
                      <Typography>Created by Chef</Typography>
                    </Grid>

                  </Grid>

                  <Grid container>
                    <Grid item xs={12}>
                      <RadioGroup
                        name="madeBy"
                        value={this.state.madeBy}
                        onChange={this.handleChange.bind(this)}
                        style={{ flexDirection: 'row' }}
                      >
                        <FormControlLabel value="michael" control={<Radio color="primary" checked={this.state.madeBy == 'michael' || this.state.madeBy === 'mazen'} />} label="Michael Chesterman" />

                        <FormControlLabel value="jansan" control={<Radio color="primary" checked={this.state.madeBy == 'jansan'} />} label="Jansan McCorkle" />
                      </RadioGroup>
                    </Grid>

                  </Grid>


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
                  Allergens
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Grid container>
                    <Grid item xs={12}>
                      <RadioGroup
                        name="allergens"
                        style={{ flexDirection: 'column' }}
                      >
                        <Grid container>
                          <Grid xs={12} md={6} sm={6} style={{ display: 'flex', flexDirection: 'column' }}>
                            <FormControlLabel
                              value="dairyFree"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('dairyFree') >= 0}
                              />}
                              label="Dairy Free"
                            />

                            <FormControlLabel
                              value="glutenFree"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('glutenFree') >= 0}
                              />}
                              label="Gluten Free"
                            />

                            <FormControlLabel
                              value="halal"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('halal') >= 0}
                              />}
                              label="Halal"
                            />

                            <FormControlLabel
                              value="noEgg"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('noEgg') >= 0}
                              />}
                              label="No egg"
                            />

                          </Grid>

                          <Grid xs={12} md={6} sm={6} style={{ display: 'flex', flexDirection: 'column' }}>
                            <FormControlLabel
                              value="noShellfish"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('noShellfish') >= 0}
                              />}
                              label="No shellfish"
                            />

                            <FormControlLabel
                              value="noNut"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('noNut') >= 0}
                              />}
                              label="No nut"
                            />

                            <FormControlLabel
                              value="soyFree"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('soyFree') >= 0}
                              />}
                              label="Soy free"
                            />

                            <FormControlLabel
                              value="vegan"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('vegan') >= 0}
                              />}
                              label="Vegan"
                            />

                            <FormControlLabel
                              value="vegetarian"
                              control={<Checkbox
                                color="primary"
                                onChange={this.handleChangeAllergens}
                                checked={this.state.allergens.indexOf('vegetarian') >= 0}
                              />}
                              label="Vegetarian"
                            />

                          </Grid>
                        </Grid>
                      </RadioGroup>
                    </Grid>

                  </Grid>
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

                  <Grid container style={{ marginTop: '25px' }}>
                    <Grid item xs={12}>
                      <Typography>Category</Typography>
                    </Grid>

                  </Grid>

                  <Grid container>
                    <Grid item xs={12}>
                      <RadioGroup
                        name="mealCategory"
                        value={this.state.mealCategory}
                        onChange={this.handleChange}
                        style={{ flexDirection: 'row' }}
                      >
                        <FormControlLabel value="omnivore" control={<Radio color="primary" checked={this.state.mealCategory == 'omnivore'} />} label="Omnivore" />

                        <FormControlLabel value="vegetarian" control={<Radio color="primary" checked={this.state.mealCategory == 'vegetarian'} />} label="Vegetarian" />

                        <FormControlLabel value="pescatarian" control={<Radio color="primary" checked={this.state.mealCategory == 'pescatarian'} />} label="Pescatarian" />

                        <FormControlLabel value="vegan" control={<Radio color="primary" checked={this.state.mealCategory == 'vegan'} />} label="Vegan" />
                      </RadioGroup>
                    </Grid>

                  </Grid>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
                    <input
                      type="file"
                      id="plateImage"
                      name="plateImage"
                      onChange={this.onFileLoad}
                    />
                    {this.state.plateImageSrc && (
                      <Button size="small" onClick={() => this.handleDeleteImage('small')}>Delete</Button>
                    )}
                  </div>
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

        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Large image
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2em' }}>
                    <input
                      type="file"
                      id="plateImageLarge"
                      name="plateImageLarge"
                      onChange={this.onFileLoad.bind(this)}
                    />
                    {this.state.plateImageLargeSrc && (
                      <Button size="small" onClick={() => this.handleDeleteImage('large')}>Delete</Button>
                    )}
                  </div>
                  <img
                    style={{ marginTop: '50px', display: 'block' }}
                    src={this.renderLargeImageUrl()}
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
                    {!this.props.loading && this.state.subIngredients ? (
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

        <Grid container justify="center" style={{ marginBottom: '75px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={4}>
                <Typography
                  type="subheading"
                  className="subheading font-medium"
                >
                  Tags
                </Typography>
                <Typography style={{ paddingRight: '80px' }}>
                  Please make sure you have at least one or two ingredients inserted on
                  the plate. This will not work if there are no ingredients. This should always
                  be done when all the ingredients are added onto the plate.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Button color="secondary" type="secondary" onClick={this.generateTags}>Generate</Button>

                  {this.state.generatedTags.map(e => (

                    <Typography style={{ marginTop: '1.5em' }} type="body2">
                      {e}
                    </Typography>
                  ))}

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
                  Substitute plate
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Paper elevation={2} className="paper-for-fields">
                  <Search className="autoinput-icon" />
                  <Autosuggest
                    id="3"
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
                    suggestions={this.state.suggestionsPlate}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequestedPlate.bind(
                      this,
                    )}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequestedPlate.bind(
                      this,
                    )}
                    onSuggestionSelected={this.onSuggestionSelectedPlate.bind(this)}
                    getSuggestionValue={this.getSuggestionValue.bind(this)}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    renderSuggestionsContainer={this.renderSuggestionsContainer.bind(
                      this,
                    )}
                    focusInputOnSuggestionClick={false}
                    inputProps={{
                      placeholder: 'Search',
                      value: this.state.valuePlate,
                      onChange: this.onChangeSubstitute.bind(this),
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
                    {this.state.substitutePlate ? (
                      <Chip
                        avatar={
                          <Avatar>
                            {' '}
                            {this.getSubIngredientAvatar(this.state.substitutePlate)}{' '}
                          </Avatar>
                        }
                        style={{ marginRight: '8px', marginBottom: '8px' }}
                        label={this.getSubstitutePlateTitle(this.state.substitutePlate)}
                        onDelete={this.handleSubstitutePlateDelete.bind(
                          this,
                          this.state.substitutePlate,
                        )}
                      />

                    ) : (
                      <Chip className="chip--bordered" label="Dish" />
                    )}

                    {!this.props.loading && this.state.substitutePlate && (
                        <Grid container>
                          <Grid item xs={12}>
                            <React.Fragment>
                                <Button style={{ marginTop: "25px" }} onClick={() => {
                                    window.location.href = `/plates/${this.state.substitutePlate._id}/edit`;
                                }}>
                                    View substitute dish
                                </Button>
                            </React.Fragment>
                          </Grid>
                      </Grid>
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
                  <Select fullWidth onChange={this.handleInstructionSelect} value={this.state.valueInstructionSelect}>
                    <MenuItem key={2134} value={'None'}>
                      None
                    </MenuItem>
                    {this.props.instructions.map((e, i) => (
                      <MenuItem key={i} value={e._id}>
                        {e.title}
                      </MenuItem>
                    ))}

                  </Select>

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
                    disabled={!this.state.hasFormChanged || this.state.submitLoading}
                    type="submit"
                    className="btn btn-primary"
                    raised
                    color="contrast"
                    onClick={() => this.handleSubmitNew()}
                  >
                    Save

                    {this.state.submitLoading && (
                      <CircularProgress
                        size={24}
                        className={this.props.classes.buttonProgress}
                      />
                    )}
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

export default withStyles(styles)(PlateEditor);
