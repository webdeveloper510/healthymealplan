import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';

import $ from 'jquery';

import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input from 'material-ui/Input';
import SearchIcon from 'material-ui-icons/Search';
import ClearIcon from 'material-ui-icons/Clear';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Dialog, {
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import {
    FormControl,
    FormControlLabel,
    FormGroup,
} from 'material-ui/Form';
import moment from 'moment';

import LifestylesColl from '../../../api/Lifestyles/Lifestyles';

import { CircularProgress } from 'material-ui/Progress';
import Loading from '../../components/Loading/Loading';
import PartnersTable from './PartnersTable';
import cloneDeep from 'lodash/cloneDeep';
import autoBind from 'react-autobind';

const tableConfig = new ReactiveVar({
    pageProperties: {
        currentPage: 1,
        pageSize: 50,
        recordCount: 0,
        maxPages: 1,
    },
    selector: {
        roles: ['partner'],
    },
    sort: {
        'profile.name.first': 1,
    },
});


class Partners extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedCheckboxes: [],
            selectedCheckboxesNumber: 0,
            options: { sort: {} },
            searchSelector: '',
            searchTextLoading: false,
            currentTabValue: 'all',

            customers: [],
        };

        autoBind(this);
    }

    componentWillUnmount() {
        this.timer = null;

        tableConfig.set({
            pageProperties: {
                currentPage: 1,
                pageSize: 50,
                recordCount: 0,
                maxPages: 1,
            },
            selector: {
                roles: ['partner'],
            },
            sort: {
                'profile.name.first': 1,
            },
        });

        this.setState({
            customers: [],
        });
    }


    componentWillMount() {
        this.timer = null;

        this.setState({
            customers: [],
        });
    }

    componentDidMount() {
        this.getCustomers();
    }

    getCustomers() {
        const config = tableConfig.get();

        const skip = config.pageProperties.currentPage < 0 ? 0 :
            (config.pageProperties.currentPage - 1) * config.pageProperties.pageSize;

        const limit = config.pageProperties.pageSize;

        this.setState({
            searchTextLoading: true,
        });

        Meteor.call('getPartnersTable', config.selector, config.sort, skip, limit, (err, res) => {
            console.log("going inhere");
            if (!err) {
                this.setState({
                    searchTextLoading: false,
                    customers: res,
                });
            }
        });
    }

    searchByName() {
        this.timer = Meteor.setTimeout(() => {
            const name = $('#search-users-text').val().trim();

            const config = tableConfig.get();
            const configCopy = cloneDeep(config);

            if (name.length) {
                configCopy.selector.name = { $regex: new RegExp(`${name}`), $options: 'gi' };
                // configCopy.selector.name = { $regex: new RegExp(`(^${searchValue}|${searchValue}$)`), $options: 'i' };
            } else {
                delete configCopy.selector.name;
            }

            // console.log(configCopy);
            configCopy.pageProperties.currentPage = 1;

            tableConfig.set(configCopy);

            this.getCustomers();
        }, 200);
    }

    handleChange(e) {
        if (this.timer) {
            Meteor.clearTimeout(this.timer);
        }
        this.setState({
            searchTextLoading: true,
            searchSelector: e.target.value,
        });

        // () => {
        this.searchByName();
        // });
    }

    // searchByNameKeyDown(event) {
    //   // enter key
    //   // clearTimeout(this.timer);

    //   // if (event.keyCode === 13 || event.keyCode == 8) {
    //   //   this.handleChange();
    //   // }
    // }

    clearSearchBox() {
        $('#search-users-text').val('');

        const config = tableConfig.get();
        const configCopy = cloneDeep(config);

        delete configCopy.selector.name;

        tableConfig.set(configCopy);

        this.setState({
            searchSelector: {},
        });
    }

    sortByOption(field) {
        // const field = event.currentTarget.getAttribute('data-sortby');

        // This is a filler object that we are going to use set the state with.
        // Putting the sortBy field using index as objects can also be used as arrays.
        // the value of it would be 1 or -1 Asc or Desc

        const config = tableConfig.get();


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

        config.sort = newOptions;

        tableConfig.set(config);

        this.setState({
            options: { sort: newOptions },
        });

        this.getCustomers();
    }

    handleTabChange(event, value) {
        this.setState({
            currentTabValue: value,
        });

        const config = tableConfig.get();
        const configCopy = cloneDeep(config);

        if (value == 'abandoned') {
            delete configCopy.selector['joinedSubscription.status'];
            configCopy.selector.joinedSubscription = { $exists: false };
        } else if (value == 'all') {
            delete configCopy.selector.joinedSubscription;
            delete configCopy.selector['joinedSubscription.status'];
        } else {
            configCopy.selector.joinedSubscription = { $exists: true };
            configCopy.selector['joinedSubscription.status'] = value;
        }

        configCopy.pageProperties.currentPage = 1;

        tableConfig.set(configCopy);

        this.getCustomers();
    }

    render() {
        const { history } = this.props;

        return (
            <div>
                <Grid
                    container
                    className="SideContent SideContent--spacer-2x--horizontal SideContent--spacer-2x--top"
                >
                    <Grid container className="clearfix">
                        <Grid item xs={6}>
                            <Typography
                                type="headline"
                                gutterBottom
                                className="headline pull-left"
                                style={{ fontWeight: 500 }}
                            >
                                Partners
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>

                            <Button
                                className="btn btn-primary"
                                onClick={() => history.push('/partners/new')}
                                raised
                                color="primary"
                                style={{ float: 'right' }}
                            >
                                Add partner
                            </Button>
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
                                onChange={this.handleTabChange}
                            >
                                <Tab label="All" value={'all'} />
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
                        {!this.state.searchTextLoading && (
                            <SearchIcon
                                className="autoinput-icon autoinput-icon--search"
                                style={{
                                    display:
                                        this.state.searchSelector.length > 0 ? 'none' : 'block',
                                    top: '33%',
                                    right: '1.8em !important',
                                }}
                            />
                        )}

                        {this.state.searchTextLoading ? (
                                <CircularProgress size={27} className="autoinput-icon--clear" />
                            ) :
                            (<ClearIcon
                                className="autoinput-icon--clear"
                                onClick={this.clearSearchBox}
                                style={{
                                    cursor: 'pointer',
                                    display: this.state.searchSelector.length > 0 ? 'block' : 'none',
                                }}
                            />)
                        }

                        <Input
                            className="input-box"
                            style={{ width: '100%', position: 'relative' }}
                            placeholder="Search partners"
                            // onChange={this.handleChange}
                            onKeyUp={this.handleChange}
                            inputProps={{
                                id: 'search-users-text',
                                'aria-label': 'Description',
                            }}
                        />
                    </div>

                    <PartnersTable
                        // results={this.props.customers}
                        results={this.state.customers}
                        lifestyles={this.props.lifestyles}
                        popTheSnackbar={this.props.popTheSnackbar}
                        searchTerm={this.state.searchSelector}
                        rowsLimit={this.state.rowsVisible}
                        history={this.props.history}
                        sortByOptions={this.sortByOption}
                        tableConfig={tableConfig}
                        getCustomers={this.getCustomers}
                    />

                </Grid>
            </div>
        );
    }
}

Partners.propTypes = {
    loading: PropTypes.bool.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.isRequired,
};

export default createContainer(() => {
    const config = tableConfig.get();

    Meteor.call('getCustomersCount', { ...config.selector, roles: ['partner'] }, config.sort, (error, result) => {
        if (!error) {
            const configCopy = cloneDeep(config);

            if (configCopy.pageProperties.recordCount != result.recordCount) {
                // console.log(result);
                configCopy.pageProperties.recordCount = result.recordCount;
                configCopy.pageProperties.maxPages = result.maxPages;
                tableConfig.set(configCopy);
            }
        }
    });

    return {
        lifestyles: LifestylesColl.find().fetch(),
    };

}, Partners);
