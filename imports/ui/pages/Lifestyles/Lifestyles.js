
import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';

import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import LifestylesCollection from '../../../api/Lifestyles/Lifestyles';
import RestrictionsCollection from '../../../api/Restrictions/Restrictions';

import Loading from '../../components/Loading/Loading';
import LifestylesTable from './LifestylesTable';

import Containers from 'meteor/jivanysh:react-list-container';

const ListContainer = Containers.ListContainer;


class Lifestyles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCheckboxes: [],
      selectedCheckboxesNumber: 0,
      options: { sort: { SKU: -1 } },
      searchSelector: '',
      currentTabValue: 0,
    };
  }

  searchByName() {
    this.setState({
      searchSelector: $('#search-lifestyles-text').val(),
    });
  }

  clearSearchBox() {
    $('#search-lifestyles-text').val('');

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
    } else { // if user selects a new table column to sort
      newOptions[field] = 1;
    }

    this.setState({
      options: { sort: newOptions },
    });
  }

  handleTabChange(event, value) {
    this.setState({ currentTabValue: value });
  }

  render() {
    const { loading, history } = this.props;

    return (!loading ? (
      <div>

        <Grid container className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top">

          <Grid container className="clearfix">
            <Grid item xs={6}>
              <Typography type="headline" gutterBottom className="headline pull-left" style={{ fontWeight: 500 }}>Lifestyles</Typography>
            </Grid>
            <Grid item xs={6}>
              <Button className="btn btn-primary" onClick={() => history.push('/lifestyles/new')} raised color="primary" style={{ float: 'right' }}>Add lifestyle</Button>
            </Grid>
          </Grid>

          <div style={{ marginTop: '25px' }}>
            <AppBar position="static" className="appbar--no-background appbar--no-shadow">
              <Tabs indicatorColor="#000" value={this.state.currentTabValue} onChange={this.handleTabChange.bind(this)}>
                <Tab label="All" />
              </Tabs>
            </AppBar>
          </div>

          <div style={{
            width: '100%',
            background: '#FFF',
            borderTopRightRadius: '2px',
            borderTopLeftRadius: '2px',
            marginTop: '3em',
            padding: '16px 25px 1em',
            boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2), 0px 0px 0px 0px rgba(0, 0, 0, 0.14), 0px 0px 1px -2px rgba(0, 0, 0, 0.12)',
            position: 'relative',
          }}
          >

            <SearchIcon
              className="autoinput-icon autoinput-icon--search"
              style={{ display: (this.state.searchSelector.length > 0) ? 'none' : 'block', top: '33%', right: '1.8em !important' }}
            />

            <ClearIcon
              className="autoinput-icon--clear"
              onClick={this.clearSearchBox.bind(this)}
              style={{
                cursor: 'pointer',
                display: (this.state.searchSelector.length > 0) ? 'block' : 'none',
              }}
            />

            <Input
              className="input-box"
              style={{ width: '100%', position: 'relative' }}
              placeholder="Search lifestyles"
              onKeyUp={this.searchByName.bind(this)}
              inputProps={{
                id: 'search-lifestyles-text',
                'aria-label': 'Description',
              }}
            />
          </div>
          <ListContainer
            limit={50}
            collection={LifestylesCollection}
            publication="lifestyles"
            joins={[
              {
                localProperty: 'restrictions',
                collection: RestrictionsCollection,
                joinAs: 'joinedRestrictions',
              },
            ]}
            options={this.state.options}
            selector={{
              $or: [{ title: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } },
              { SKU: { $regex: new RegExp(this.state.searchSelector), $options: 'i' } }],
            }}
          >
            <LifestylesTable
              popTheSnackbar={this.props.popTheSnackbar}
              searchTerm={this.state.searchSelector}
              rowsLimit={this.state.rowsVisible}
              history={this.props.history}
              sortByOptions={this.sortByOption.bind(this)}
            />

          </ListContainer>


        </Grid>
      </div>
    ) : <Loading />);
  }
}

Lifestyles.propTypes = {
  loading: PropTypes.bool.isRequired,
  lifestyles: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('lifestyles');
  const subscription2 = Meteor.subscribe('restrictions');

  return {
    loading: !subscription.ready() && !subscription2.ready(),
    lifestyles: LifestylesCollection.find().fetch(),
  };
}, Lifestyles);
