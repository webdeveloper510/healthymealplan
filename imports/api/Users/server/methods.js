import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";

import { Accounts } from "meteor/accounts-base";
import editProfile from "./edit-profile";
import rateLimit from "../../../modules/rate-limit";

Meteor.methods({
  "users.sendVerificationEmail": function usersSendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
  },
  "users.editProfile": function usersEditProfile(profile) {
    check(profile, {
      emailAddress: String,
      profile: {
        name: {
          first: String,
          last: String
        },

        phone: String
      }
    });

    return editProfile({ userId: this.userId, profile })
      .then(response => response)
      .catch(exception => {
        throw new Meteor.Error("500", exception);
      });
  },

  "users.addNewStaff": function addNewStaff(data) {
    const empId = Accounts.createUser({
      email: data.email,
      password: data.password
    });

    Roles.addUsersToRoles(empId, [data.staffType]);

    return empId;
  },

  "customers.step1": function customerStep1(data) {
    check(data, {
      email: String,
      postalCode: String,
      firstName: String
    });

    try {
      var userId = Accounts.createUser({
        email: data.email,
        profile: {
          name: {
            first: data.firstName
          }
        }
      });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }

    Roles.addUsersToRoles(userId, ["customer"]);

    Meteor.users.update(
      { _id: userId },
      { $set: { postalCode: data.postalCode, status: "abandoned" } }
    );

    return userId;
  },

  "customers.step2": function customerStep1(data) {
    check(data, {
      email: String,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      adultOrChild: String
    });

    // let userId;

    // try {
    //   userId = Accounts.createUser({
    //     email: data.email,
    //     profile: {
    //       name: {
    //         first: data.firstName
    //       }
    //     }
    //   });
    // } catch (err) {
    //   throw new Meteor.Error("500", err.reason + "");
    // }

    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phoneNumber,
          adultOrChild: data.adultOrChild
        }
      }
    );

    return userId;
  }
});

rateLimit({
  methods: [
    "users.sendVerificationEmail",
    "users.editProfile",
    "users.addNewStaff",
    "customers.step1"
  ],
  limit: 5,
  timeRange: 1000
});
