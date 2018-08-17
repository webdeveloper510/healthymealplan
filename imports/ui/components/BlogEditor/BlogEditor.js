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

import AddAPhotoIcon from 'material-ui-icons/AddAPhoto';
import CloseIcon from 'material-ui-icons/Close';

import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Switch from 'material-ui/Switch';


import slugify from 'slugify';

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

import {
  ImageSideButton,
  Block,
  addNewBlock,
  createEditorState,
  Editor,
} from 'medium-draft';

import { convertFromRaw, convertToRaw } from 'draft-js';
import mediumDraftExporter from 'medium-draft/lib/exporter';
import mediumDraftImporter from 'medium-draft/lib/importer';


import 'medium-draft/lib/index.css';
import './BlogEditor.scss';

class CustomImageSideButton extends ImageSideButton {
  constructor(props) {
    super(props);

    this.state = {
      imageLoading: false,
    };
  }

  onClick() {
    this.input.value = null;
    this.input.click();
  }

  onChange(e) {
    const file = e.target.files[0];
    if (file.type.indexOf('image/') === 0) {
      this.setState({
        imageLoading: true,
      });
      S3.upload({
        file,
        path: 'images',
      }, (err, res) => {
        this.setState({
          imageLoading: false,
        });
        if (err) {
          alert('There was an error uploading the image');
        } else {
          this.props.setEditorState(addNewBlock(
            this.props.getEditorState(),
            Block.IMAGE, {
              src: `${Meteor.settings.public.S3BucketDomain}${res.relative_url}`,
            },
          ));
        }

        this.props.close();
      });
    }
  }

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        onClick={this.onClick}
        title="Add an Image"
      >
        {this.state.imageLoading ? (
          <CircularProgress size={18} />
        ) : (<AddAPhotoIcon style={{ width: '18px', height: '18px' }} />)}

        <input
          type="file"
          accept="image/*"
          ref={(c) => { this.input = c; }}
          onChange={this.onChange}
          style={{ display: 'none' }}
        />
      </button>
    );
  }
}

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


class BlogEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: this.props.blog && !this.props.loading ? createEditorState(convertToRaw(mediumDraftImporter(this.props.blog.content))) : createEditorState(),
      title: !this.props.loading && this.props.blog ? this.props.blog.title : '',

      blogImageLargeSrc: !this.props.loading && this.props.blog && this.props.blog.largeImageUrl != undefined ? this.props.blog.largeImageUrl : '',
      largeImageFieldChanged: false,
      blogImageSrc: !this.props.loading && this.props.blog && this.props.blog.imageUrl != undefined ? this.props.blog.imageUrl : '',
      imageFieldChanged: false,

      excerpt: !this.props.loading && this.props.blog && this.props.blog.excerpt != undefined ? this.props.blog.excerpt : '',

      slug: !this.props.loading && this.props.blog ? this.props.blog.slug : '',
      category: !this.props.loading && this.props.blog ? this.props.blog.category : 'diets',

      status: !this.props.loading && this.props.blog ? this.props.blog.status : 'draft',

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
        excerpt: {
          required: true,
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
    this.setState({
      hasFormChanged: true,
      [event.target.name]: event.target.value,
    });

    if (event.target.name == 'title' || event.target.name == 'slug') {
      this.setState({
        slug: slugify(event.target.value),
      });
    }
  }

  handleCategory(event, value) {
    this.setState({
      category: event.target.value,
      hasFormChanged: true,
    });
  }

  // Use your imagination to render suggestions.
  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }


  onFileLoad(e) {
    const imageType = e.currentTarget.id;
    const reader = new FileReader();
    const file = e.target.files[0];

    reader.addEventListener('load', () => {
      if (imageType == 'blogImage') {
        this.setState({
          blogImageSrc: reader.result,
          imageFieldChanged: true,
          hasFormChanged: true,
        });
      } else {
        this.setState({
          blogImageLargeSrc: reader.result,
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
    const { popTheSnackbar, history, blog } = this.props;

    const existingBlog = blog && blog._id;
    localStorage.setItem('blogDeleted', blog.title);
    const blogDeletedMessage = `${localStorage.getItem(
      'blogDeleted',
    )} deleted from main courses.`;

    this.deleteDialogHandleRequestClose();

    Meteor.call('blog.remove', existingBlog, (error) => {
      if (error) {
        popTheSnackbar({
          message: error.reason,
        });
      } else {
        popTheSnackbar({
          message: blogDeletedMessage,
        });

        history.push('/blog');
      }
    });
  }

  handleRemove() {
    this.deleteDialogHandleClickOpen();
  }

  handleSubmitNew() {
    if ($('#blog-editor').valid()) {
      this.handleSubmit();
    }
  }

  handleSubmit() {
    console.log('handling submit');

    this.setState({
      submitSuccess: false,
      submitLoading: true,
    });

    const { history, popTheSnackbar } = this.props;
    const existingBlog = this.props.blog && this.props.blog._id;
    const methodToCall = existingBlog ? 'blog.update' : 'blog.insert';

    const blog = {
      title: this.state.title,
      excerpt: this.state.excerpt,
      slug: this.state.slug,
      status: this.state.status,
      category: this.state.category,
      content: mediumDraftExporter(this.state.editorState.getCurrentContent()),
    };

    console.log(blog);

    if (existingBlog) blog._id = existingBlog;

    Meteor.call(methodToCall, blog, (error, blogId) => {
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
          'blogForSnackbar',
          blog.title || $('[name="title"]').val(),
        );

        const confirmation = existingBlog
          ? `${localStorage.getItem('blogForSnackbar')} main course updated.`
          : `${localStorage.getItem('blogForSnackbar')} main course added.`;

        if (this.state.blogImageSrc || this.state.blogImageLargeSrc) {
          if (this.state.blogImageSrc) {
            S3.upload({
              file: document.getElementById('blogImage').files[0],
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
                  'blog.updateImageUrl',
                  {
                    _id: blogId,
                    imageUrl: res.relative_url,
                    large: false,
                  },
                  (err, blogId) => {
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

          if (this.state.blogImageLargeSrc) {
            S3.upload({
              file: document.getElementById('blogImageLarge').files[0],
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
                  'blog.updateImageUrl',
                  {
                    _id: blogId,
                    imageUrl: res.relative_url,
                    large: true,
                  },
                  (err, blogId) => {
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
            buttonLink: `/blog/${blogId}/edit`,
          });

          this.props.history.push('/blog');
        } else {
          this.setState({
            submitSuccess: true,
            submitLoading: false,
          });

          this.props.popTheSnackbar({
            message: confirmation,
            buttonText: 'View',
            buttonLink: `/blog/${blogId}/edit`,
          });

          this.props.history.push('/blog');
        }
      }
    });
  }

  renderDeleteDialog() {
    return (
      <Dialog
        open={this.state.deleteDialogOpen}
        onClose={this.deleteDialogHandleRequestClose}
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
          Delete {this.props.blog ? this.props.blog.title.toLowerCase() : ''}?
        </Typography>
        <DialogContent>
          <DialogContentText className="subheading">
            Are you sure you want to delete{' '}
            {this.props.blog ? this.props.blog.title.toLowerCase() : ''}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.deleteDialogHandleRequestClose}
            color="default"
          >
            Cancel
          </Button>
          <Button
            stroked
            className="button--bordered button--bordered--accent"
            onClick={this.handleRemoveActual}
            color="accent"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  editorOnChange(editorState) {
    this.setState({ editorState, hasFormChanged: true, });
  }

  handlePostStatus(event) {
    this.setState({
      hasFormChanged: true,
      status: event.target.checked ? 'published' : 'draft',
    });
  }

  renderImageUrl() {
    if (this.props.newBlog || this.state.imageFieldChanged) {
      return this.state.blogImageSrc;
    } else if (this.props.document && this.props.document.imageUrl) {
      return `${Meteor.settings.public.S3BucketDomain}${this.state.blogImageSrc}`;
    }

    return '';
  }

  renderLargeImageUrl() {
    if (this.props.newBlog || this.state.largeImageFieldChanged) {
      return this.state.blogImageLargeSrc;
    } else if (this.props.document && this.props.document.largeImageUrl) {
      return `${Meteor.settings.public.S3BucketDomain}${this.state.blogImageLargeSrc}`;
    }

    return '';
  }


  render() {
    const { blog, history, loading } = this.props;

    const buttonClassname = classNames({
      [this.props.classes.buttonSuccess]: this.state.submitSuccess,
    });

    return !loading ? (
      <form
        ref={form => (this.form = form)}
        id="blog-editor"
        style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}
        onSubmit={event => event.preventDefault()}
      >
        <Grid container justify="center">
          <Grid item xs={12}>
            <Button
              onClick={() => this.props.history.push('/blog')}
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
                <ChevronLeft style={{ marginRight: '4px' }} /> Blog
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
              {blog && blog._id ? `${blog.title}` : 'Add article'}
            </Typography>

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
                onClick={() => history.push('/blog')}
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


        <Grid container style={{ marginBottom: '50px' }}>

          <Grid item xs={12} md={8} lg={8}>

            <Paper className="paper-for-fields" elevation={2}>

              <div style={{ marginBottom: '1em' }}>
                <TextField fullWidth name="title" label="Title" value={this.state.title} onChange={this.handleChange} />
              </div>

              <div style={{ marginBottom: '1em' }}>
                <Typography type="body2">Thumbnail</Typography>
                <input
                  type="file"
                  id="blogImage"
                  name="blogImage"
                  onChange={this.onFileLoad}
                  style={{ marginBottom: '25px' }}
                />
                <img
                  style={{ marginTop: '50px', display: 'block' }}
                  src={this.renderImageUrl()}
                  style={{ maxWidth: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1em' }}>
                <Typography type="body2">Featured image</Typography>
                <input
                  type="file"
                  id="blogImageLarge"
                  name="blogImageLarge"
                  onChange={this.onFileLoad}
                  style={{ marginBottom: '25px' }}
                />
                <img
                  style={{ marginTop: '50px', display: 'block' }}
                  src={this.renderLargeImageUrl()}
                  style={{ maxWidth: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1em' }}>
                <TextField multiline fullWidth name="excerpt" label="Excerpt" value={this.state.excerpt} onChange={this.handleChange} />
              </div>

              <div className="editor-container">
                <Editor
                  onChange={this.editorOnChange}
                  editorState={this.state.editorState}
                  blockButtons={[
                    {
                      label: 'H1',
                      style: 'header-one',
                      icon: 'header',
                      description: 'Heading 1',
                    },
                    {
                      label: 'H2',
                      style: 'header-two',
                      icon: 'header',
                      description: 'Heading 2',
                    },
                    {
                      label: 'H3',
                      style: 'header-three',
                      icon: 'header',
                      description: 'Heading 3',
                    },
                    {
                      label: 'UL',
                      style: 'unordered-list-item',
                      icon: 'list-ul',
                      description: 'Unordered List',
                    },
                  ]}
                  sideButtons={[{
                    title: 'Image',
                    component: CustomImageSideButton,
                  }]}
                />
              </div>
            </Paper>

          </Grid>
          <Grid item xs={12} md={4} lg={4}>

            <Paper className="paper-for-fields" elevation={2}>

              <Typography type="subheading">Slug</Typography>

              <TextField name="slug" fullWidth value={this.state.slug} onChange={this.handleChange} />

              <div style={{ margin: '1em 0' }}>
                <Typography type="subheading">Status</Typography>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                  <Switch
                    inputProps={{ name: 'status' }}
                    checked={this.state.status == 'published'}
                    onChange={this.handlePostStatus}
                  />

                  <Typography type="body2" style={{ textTransform: 'capitalize' }}>{this.state.status}</Typography>

                </div>
              </div>
              <div style={{ margin: '1em 0' }}>
                <Typography type="subheading">Category</Typography>
                <Select fullWidth onChange={this.handleCategory} value={this.state.category}>
                  <MenuItem key={1} value="diets">
                    Diets
                  </MenuItem>
                </Select>
              </div>
            </Paper>

          </Grid>

        </Grid>


        <Grid container justify="center" style={{ marginBottom: '50px' }}>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={4}>
                {this.props.newBlog ? (
                  ''
                ) : (
                    <Button
                      style={{ backgroundColor: danger, color: '#FFFFFF' }}
                      raised
                      onClick={
                        blog && blog._id
                          ? this.handleRemove
                          : () => this.props.history.push('/blog')
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
                    onClick={() => history.push('/blog')}
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

BlogEditor.propTypes = {
  blog: PropTypes.object.isRequired,
  instructions: PropTypes.array.isRequired,
  potentialSubIngredients: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  popTheSnackbar: PropTypes.func.isRequired,
  document: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withStyles(styles)(BlogEditor);
