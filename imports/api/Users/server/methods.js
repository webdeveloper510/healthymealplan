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
    const userId = Accounts.createUser({
      email: data.email,
      postalCode: data.postalCode,
      "profile.name.first": data.first_name,
      status: "abandoned"
    });

    Roles.addUsersToRoles(userId, ["customer"]);

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
