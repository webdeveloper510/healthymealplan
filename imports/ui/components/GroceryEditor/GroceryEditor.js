/* eslint-disable max-len, no-return-assign */

/*
  Refactor the autocomplete tabs into their own components
  not a priority for now, but this is an itch that we should really scratch.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import Button from 'material-ui/Button';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import { InputLabel, InputAdornment } from 'material-ui/Input';
import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Select from 'material-ui/Select';
import Radio, { RadioGroup } from 'material-ui/Radio';
import CloseIcon from 'material-ui-icons/Close';
import IconButton from 'material-ui/IconButton';

import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
} from 'material-ui/Dialog';

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

class GroceryEditor extends React.Component {
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
      valueMealType: this.props.plate ? this.props.plate.mealType : 'meat',
      deleteDialogOpen: false,
      imageFieldChanged: false,
      largeImageFieldChanged: false,

      variants: this.props.plate && this.props.plate.hasOwnProperty('variants') ? this.props.plate.variants : [],

      hasFormChanged: false,
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

        type: {
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

  handleRemoveActual() {
    const { popTheSnackbar, history, plate } = this.props;

    const existingPlate = plate && plate._id;
    localStorage.setItem('plateDeleted', plate.title);
    const plateDeletedMessage = `${localStorage.getItem(
      'plateDeleted',
    )} deleted from groceries.`;

    this.deleteDialogHandleRequestClose.bind(this);

    Meteor.call('groceries.remove', existingPlate, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: plateDeletedMessage,
        });

        history.push('/groceries');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmitNew() {
    if ($('#side-editor').valid()) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    console.log('Reaching submit handle');
    const { history, popTheSnackbar } = this.props;
    const existingPlate = this.props.plate && this.props.plate._id;
    const methodToCall = existingPlate ? 'groceries.update' : 'groceries.insert';

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    const plate = {
      title: document.querySelector('#title').value.trim(),
      subtitle: document.querySelector('#subtitle').value.trim(),
      description: document.querySelector('#description').value.trim(),
      variants: this.state.variants,
      mealType: this.state.valueMealType.trim().toLowerCase(),
    };

    if (existingPlate) plate._id = existingPlate;

    console.log(plate);

    Meteor.call(methodToCall, plate, (error, plateId) => {
      console.log('Inside methid');
      if (error) {

        this.setState({
          submitSuccess: false,
          submitLoading: false,
        });

        this.props.popTheSnackbar({
          message: error.reason,
        });
      } else {
        console.log(plateId);

        localStorage.setItem(
          'plateForSnackbar',
          plate.title || $('[name="title"]').val(),
        );

        const confirmation = existingPlate
          ? `${localStorage.getItem('plateForSnackbar')} grocery item updated.`
          : `${localStorage.getItem('plateForSnackbar')} grocery item added.`;

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
                  'groceries.updateImageUrl',
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
                  'groceries.updateImageUrl',
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
            buttonLink: `/groceries/${plateId}/edit`,
          });

          this.props.history.push('/groceries');
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          this.props.popTheSnackbar({
            message: confirmation,
            buttonText: 'View',
            buttonLink: `/groceries/${plateId}/edit`,
          });

          this.props.history.push('/groceries');
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

  titleFieldChanged(e) {
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

  renderImageUrl() {
    if (this.props.newPlate || this.state.imageFieldChanged) {
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

        Meteor.call('groceries.deleteImageUrl', toSend, (err, res) => {
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

  handleVariantRemove(index) {
    const variantsCopy = this.state.variants.slice();
    variantsCopy.splice(index, 1);

    this.setState({
        variants: variantsCopy,
        hasFormChanged: true,
    })

  }

  changeVariantField(e, index, type){
    console.log(e.target.value)
      console.log(index);
    console.log(type);

    const variantsCopy = this.state.variants.slice();

    variantsCopy[index][type] = e.target.value;

    this.setState({
        variants: variantsCopy,
        hasFormChanged: true,
    })
  }

  handleVariantAdd() {
    const variantName = document.getElementById('variantAddName');
    const variantPrice = document.getElementById('variantAddPrice');
    const calories = document.getElementById('calories');
    const proteins = document.getElementById('proteins');
    const carbs = document.getElementById('carbs');
    const fat = document.getElementById('fat');

    const newVariant = {
      _id: Random.id(),
      name: variantName.value.trim(),
      price: variantPrice.value.trim(),
      calories: calories.value.trim(),
      proteins: proteins.value.trim(),
      carbs: carbs.value.trim(),
      fat: fat.value.trim(),
    };

    if (variantName.value === "" || variantPrice.value === "") {

      this.props.popTheSnackbar({
          message: 'Name and price cannot be empty',
      });

      return;
    }

    const variantsCopy = this.state.variants.slice();
    variantsCopy.push(newVariant);

    this.setState({
        variants: variantsCopy,
        hasFormChanged: true,
    });

    variantName.value = "";
    variantPrice.value = "";
    calories.value = "";
    proteins.value = "";
    carbs.value = "";
    fat.value = "";
  }

  render() {
    const { plate, history, loading } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return !loading ? (
      <form
        id="side-editor"
        style={{ width: '100%' }}
        ref={form => (this.form = form)}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/groceries')}
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
                <ChevronLeft style={{ marginRight: '4px' }} /> Groceries
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
              {plate && plate._id ? `${plate.title}` : 'Add grocery'}
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
                onClick={() => history.push('/groceries')}
              >
                Cancel
              </Button>
              <Button
                disabled={!this.state.hasFormChanged || this.state.submitLoading}
                raised
                className="btn btn-primary"
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
                  Grocery
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
                      Price
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <Paper elevation={2} className="paper-for-fields">

                      <Typography style={{marginTop: '1.2em'}} type="subheading">Variants </Typography>

                      {this.state.variants.length > 0 && this.state.variants.map((e, i) => {
                          return (
                              <React.Fragment>
                                  <Grid container alignItems="baseline">
                                    {i == 0 && (
                                        <Grid item xs={12}>
                                            <Typography style={{
                                                marginBottom: '-1em',
                                                marginTop: '1em',
                                                position: 'relative',
                                                top: '8px'
                                            }}>Default</Typography>
                                        </Grid>
                                    )}
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            type="text"
                                            margin="normal"
                                            id="variantName"
                                            label="Name"
                                            name="variantName"
                                            value={e.name}
                                            onChange={(el) => this.changeVariantField(el, i, 'name')}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            type="number"
                                            margin="normal"
                                            id="variantPrice"
                                            label="Price"
                                            name="variantPrice"
                                            value={e.price}
                                            InputProps={{
                                                'aria-label': 'Description',
                                                startAdornment: <InputAdornment position="start">
                                                    {'$'}
                                                </InputAdornment>,
                                            }}
                                            onChange={(el) => this.changeVariantField(el, i, 'price')}
                                        />
                                    </Grid>
                                    <IconButton onClick={() => this.handleVariantRemove(i)} ><CloseIcon /></IconButton>
                                  </Grid>

                                  <Grid container>
                                    <Grid item xs={8}>
                                        <Table className="table-lifestyles">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>
                                                        <Typography
                                                            type="subheading"
                                                        >
                                                            Calories
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            type="subheading"
                                                        >
                                                            Proteins
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            type="subheading"
                                                        >
                                                            Carbs
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            type="subheading"
                                                        >
                                                            Fat
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>
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
                                                            defaultValue={e.calories}
                                                            onChange={(el) => this.changeVariantField(el, i, 'calories')}
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
                                                            defaultValue={e.proteins}
                                                            onChange={(el) => this.changeVariantField(el, i, 'proteins')}
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
                                                            defaultValue={e.carbs}
                                                            onChange={(el) => this.changeVariantField(el, i, 'carbs')}
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
                                                            defaultValue={e.fat}
                                                            onChange={(el) => this.changeVariantField(el, i, 'fat')}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                  </Grid>
                              </React.Fragment>
                          )
                      })}

                      <React.Fragment>
                          <Typography style={{marginTop: '2em'}} type="body1">Add a variant</Typography>
                          <Grid container alignItems='baseline'>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                  type="text"
                                  margin="normal"
                                  id="variantAddName"
                                  label="Name"
                                  name="variantAddName"
                                  fullWidth
                                  onChange={this.titleFieldChanged.bind(this)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                  type="number"
                                  margin="normal"
                                  id="variantAddPrice"
                                  label="Price"
                                  name="variantAddPrice"
                                  fullWidth
                                  InputProps={{
                                    'aria-label': 'Description',
                                    startAdornment: <InputAdornment position="start">
                                        {'$'}
                                    </InputAdornment>,
                                  }}
                                  onChange={this.titleFieldChanged.bind(this)}
                                />
                            </Grid>

                            <Grid container>
                              <Grid item md={8} xs={12}>
                                  <Table className="table-lifestyles">
                                      <TableHead>
                                          <TableRow>
                                              <TableCell>
                                                  <Typography
                                                      type="subheading"
                                                  >
                                                      Calories
                                                  </Typography>
                                              </TableCell>
                                              <TableCell>
                                                  <Typography
                                                      type="subheading"
                                                  >
                                                      Proteins
                                                  </Typography>
                                              </TableCell>
                                              <TableCell>
                                                  <Typography
                                                      type="subheading"
                                                  >
                                                      Carbs
                                                  </Typography>
                                              </TableCell>
                                              <TableCell>
                                                  <Typography
                                                      type="subheading"
                                                  >
                                                      Fat
                                                  </Typography>
                                              </TableCell>
                                          </TableRow>
                                      </TableHead>
                                      <TableBody>
                                          <TableRow>
                                              <TableCell>
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
                                                      id="calories"
                                                      defaultValue="0"
                                                      onChange={this.titleFieldChanged.bind(this)}
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
                                                      id="proteins"
                                                      defaultValue="0"
                                                      onChange={this.titleFieldChanged.bind(this)}
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
                                                      id="carbs"
                                                      defaultValue="0"
                                                      onChange={this.titleFieldChanged.bind(this)}
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
                                                      id="fat"
                                                      defaultValue="0"
                                                      onChange={this.titleFieldChanged.bind(this)}
                                                  />
                                              </TableCell>
                                          </TableRow>
                                      </TableBody>
                                  </Table>
                              </Grid>
                            </Grid>

                            <Grid container>
                              <Grid item xs={12} md={12} style={{ marginTop: '10px' }}>
                                  <Button raised secondary default onClick={this.handleVariantAdd}>Add</Button>
                              </Grid>
                            </Grid>
                          </Grid>
                      </React.Fragment>
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
                    <MenuItem key={2} value="meat">
                      Meat
                    </MenuItem>
                    <MenuItem key={3} value="vegetables">
                      Vegetables
                    </MenuItem>
                    <MenuItem key={4} value="fruit">
                      Fruit
                    </MenuItem>
                    <MenuItem key={4} value="dairy">
                        Dairy
                    </MenuItem>
                    <MenuItem key={4} value="bakery">
                        Bakery
                    </MenuItem>
                    <MenuItem key={4} value="miscellaneous">
                        Miscellaneous
                    </MenuItem>
                  </TextField>

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
                      onChange={this.onFileLoad.bind(this)}
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
                          : () => this.props.history.push('/groceries')
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
                    onClick={() => history.push('/groceries')}
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

GroceryEditor.propTypes = {
  plate: PropTypes.object,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
};

export default withStyles(styles)(GroceryEditor);
