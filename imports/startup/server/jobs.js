import { Meteor } from 'meteor/meteor';
import Jobs from '../../api/Jobs/Jobs';

Jobs.startJobServer();

// Jobs.setLogStream(process.stdout.error);

Jobs.events.on('call', function (msg) {
  if (msg.method === 'jobDone' && error == null) {
    console.log("Job" + msg.params[0] + "finished!");
  }
});


Jobs.events.on('error', function (msg) {
    console.log("Job" + msg.params[0] + " error!");
    console.log(msg.error);
});
