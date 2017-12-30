import Subscriptions from "../../../api/Subscriptions/Subscriptions";
import Jobs from "../../../api/Jobs/Jobs";

job.processJobs("coreJobQueue", "setSubscriptionActive", function(job, cb) {
  let insertData = job.data;
  // do anything with the job data here.
  // when done, call job.done() or job.fail()
  try {
    Subscriptions.update(
      {
        _id: insertData.subscriptionId
      },
      {
        $set: {
          status: "active"
        }
      }
    );
  } catch (error) {
    job.log(
      "setSubscriptionActive for customer: " +
        insertData.customerId +
        " with subscription - " +
        insertData.subscriptionId +
        " failed."
    );
    job.fail(error); //when failing
  }

  try {
    Meteor.users.update(
      {
        _id: insertData.customerId
      },
      {
        $set: {
          status: "active"
        }
      }
    );
  } catch (error) {
    job.log(
      "setSubscriptionActive for customer: " +
        insertData.customerId +
        " with subscription - " +
        insertData.subscriptionId +
        " failed."
    );
    job.fail(error); //when failing
  }

  job.done(); // when done successfully

  // Be sure to invoke the callback
  // when work on this job has finished
  cb();
});
