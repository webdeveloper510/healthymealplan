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

  "customers.step2": function customerStep2(data) {
    check(data, {
      id: String,
      email: String,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      adultOrChild: String
    });

    try {
      Meteor.users.update(
        { _id: data.id },
        {
          $set: {
            "profile.name.first": data.firstName,
            "profile.name.last": data.lastName,
            phone: data.phoneNumber,
            adultOrChild: data.adultOrChild
          }
        }
      );
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },

  "customers.step3": function customerStep3(data) {
    check(data, {
      id: String,
      lifestyle: Array,
      extra: String,
      discount: String,
      restrictions: Array,
      preferences: Array
    });

    try {
      Meteor.users.update(
        { _id: data.id },
        {
          $set: {
            lifestyle: data.lifestyle,
            extra: data.extra,
            discount: data.discount,
            restrictions: data.restrictions,
            preferences: data.preferences
          }
        }
      );
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
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
