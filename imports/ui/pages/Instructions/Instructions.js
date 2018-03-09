import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { teal, red } from 'material-ui/colors';
import Containers from 'meteor/utilities:react-list-container';

const ListContainer = Containers.ListContainer;

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';

import $ from 'jquery';

import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import DeleteIcon from 'material-ui-icons/Delete';
import FilterListIcon from 'material-ui-icons/FilterList';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import InstructionsCollection from '../../../api/Instructions/Instructions';

import AuthenticatedSideNav from '../../components/AuthenticatedSideNav/AuthenticatedSideNav';
import Loading from '../../components/Loading/Loading';
import InstructionsTable from './InstructionsTable';

const primary = teal[500];
const danger = red[700];

class Instructions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkboxesSelected: false,
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { title: 1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
  }

  searchByName() {
    this.setState({
      searchSelector: $('#search-instruction-text').val(),
    });
  }

  clearSearchBox() {
    $('#search-instruction-text').val('');

    this.setState({
      searchSelector: {},
    });
  }

  sortByOption(field) {
    // const field = event.currentTarget.getAttribute('data-sortby');

    // This is a filler object that we are going to use set the state with.
    // Putting the sortBy field using index as objects can also be used as arrays.
    // the value of it would be 1 or -1 Asc or Desc

    const stateCopyOptions = this.state.options;
    const newOptions = {};

    // if user has selected to sort by that table column
    if (stateCopyOptions.sort.hasOwnProperty(`${field}`)) {
      if (stateCopyOptions.sort[field] === -1) {
        newOptions[field] = 1;
      } else if (stateCopyOptions.sort[field] === 1) {
        newOptions[field] = -1;
      }
    } else {
      // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    this.setState({
      options: { sort: newOptions },
    });
  }

  rowSelected(e) {
    const selectedRowId = e.target.parentNode.parentNode.getAttribute('id');

    $(`.${selectedRowId}`).toggleClass('row-selected');

    const currentlySelectedCheckboxes = this.state.selectedCheckboxesNumber;

    this.setState({
      checkboxesSelected: true,
      selectedCheckboxesNumber: currentlySelectedCheckboxes + 1,
    });
  }

  renderTableHeadClasses() {
    const classes = `${
      this.state.checboxesSelected ? 'table-head--show' : 'table-head--hide'
    }`;
    return classes;
  }

  renderSubIngredientsNumber(subIngredient) {
    if (subIngredient && subIngredient.length > 1) {
      return `${subIngredient.length} sub-ingredients`;
    } else if (subIngredient && subIngredient.length == 1) {
      return `${subIngredient.length} sub-ingredient`;
    }

    return '';
  }

  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  render() {
    return !this.props.loading ? (
      <div>

        <Grid
          container
          className="SideContent SideContent--spacer-2x--top SideContent--spacer-2x--horizontal"
        >
          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography
                type="headline"
                gutterBottom
                className="pull-left headline"
                style={{ fontWeight: 500 }}
                color="inherit"
              >
                Instructions
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Link to="/instructions/new">
                <Button
                  className="btn btn-primary"
                  raised
                  color="primary"
                  style={{ float: 'right' }}
                >
                  Add instruction
                </Button>
              </Link>
            </Grid>
          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar
              position="static"
              className="appbar--no-background appbar--no-shadow"
            >
              <Tabs
                indicatorColor="#000"
                value={this.state.currentTabValue}
                onChange={this.handleTabChange.bind(this)}
              >
                <Tab label="All" />

              </Tabs>
            </AppBar>
          </div>

          <div
            style={{
              width: '100%',
              background: '#FFF',
              borderTopRightRadius: '2px',
              borderTopLeftRadius: '2px',
              marginTop: '3em',
              padding: '16px 25px 1em',
              boxShadow:
                '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
              position: 'relative',
            }}
          >
            <SearchIcon
              className="autoinput-icon autoinput-icon--search"
              style={{
                display:
                  this.state.searchSelector.length > 0 ? 'none' : 'block',
                top: '33%',
                right: '1.8em !important',
              }}
            />

            <ClearIcon
              className="autoinput-icon--clear"
              onClick={this.clearSearchBox.bind(this)}
              style={{
                cursor: 'pointer',
                display: this.state.searchSelector.length > 0 ? 'block' : 'none',
              }}
            />

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search instructions"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: 'search-instruction-text',
                'aria-label': 'Description',
              }}
            />
          </div>
          <ListContainer
            limit={50}
            collection={InstructionsCollection}
            publication="instructions"
            options={this.state.options}
            selector={{
              $or: [
                {
                  title: {
                    $regex: new RegExp(this.state.searchSelector),
                    $options: 'i',
                  },
                },
                {
                  description: {
                    $regex: RegExp(this.state.searchSelector),
                    $options: 'i',
                  },
                },
              ],
            }}
          >
            <InstructionsTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              history={this.props.history}
              sortByOptions={this.sortByOption.bind(this)}
            />
          </ListContainer>

          {/*
                joins={[{
                    localProperty: "typeId",
                    collection: IngredientTypes,
                    joinAs: "typeMain"
                },{
                  localProperty: "subIngredients",
                  collection: IngredientsCollection,
                  joinAs: "subs"
                }]}
            */}

        </Grid>
      </div>
    ) : (
      <Loading />
    );
  }
}

Instructions.propTypes = {
  loading: PropTypes.bool.isRequired,
  instructions: PropTypes.arrayOf(PropTypes.object),
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('instructions');

  return {
    loading: !subscription.ready(),
    instructions: InstructionsCollection.find().fetch(),
  };
}, Instructions);
