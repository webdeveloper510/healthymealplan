import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Instructions from "./Instructions";
import rateLimit from "../../modules/rate-limit";

Meteor.methods({
  "instructions.insert": function instructionsInsert(instruction) {
    check(instruction, {
      title: String,
      description: String
    });

    const existingInstruction = Instructions.findOne({
      title: instruction.title
    });

    if (existingInstruction) {
      throw new Meteor.Error("500", `${instruction.title} is already present`);
    }

    try {
      return Instructions.insert({
        title: instruction.title,
        description: instruction.description,
        createdBy: this.userId
      });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "instructions.update": function instructionsUpdate(instruction) {
    check(instruction, {
      _id: String,
      title: String,
      description: String
    });

    try {
      const instructionId = instruction._id;
      Instructions.update(instructionId, {
        $set: {
          title: instruction.title,
          description: instruction.description
        }
      });

      return instructionId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "instructions.remove": function instructionsRemove(instructionId) {
    check(instructionId, String);

    try {
      return Instructions.remove(instructionId);
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },

  "instructions.batchRemove": function instructionsBatchRemove(instructionIds) {
    check(instructionIds, Array);
    console.log("Server: instructions.batchRemove");

    try {
      return Instructions.remove({ _id: { $in: instructionIds } });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  }
});

rateLimit({
  methods: [
    "instructions.insert",
    "instructions.update",
    "instructions.remove",
    "instructions.batchRemove"
  ],
  limit: 5,
  timeRange: 1000
});
