import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Deliveries from './Deliveries';
import rateLimit from '../../modules/rate-limit';
import { generateComponentAsPDF } from '../../modules/server/generate-labels.js';
import Label from '../../ui/components/Label/Label';

Meteor.methods({
  'deliveries.insert': function deliveriesInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    const existsCategory = Deliveries.findOne({ title: cat.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${cat.title} is already present`);
    }

    try {
      return Deliveries.insert({ title: cat.title, types: cat.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'deliveries.update': function deliveriesUpdate(deliveryId, statusChange) {
    check(deliveryId, String);
    check(statusChange, String);

    console.log(deliveryId);
    console.log(statusChange);

    try {
      Deliveries.update({ _id: deliveryId }, { $set: { status: statusChange } });
      return deliveryId;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'deliveries.batchUpdate': function deliveriesBatchUpdate(deliveryIds, statusChange) {
    check(deliveryIds, Array);
    check(statusChange, String);

    console.log(deliveryIds);
    console.log(statusChange);

    console.log('Server: deliveries.batchUpdate');

    try {
      return Deliveries.update({ _id: { $in: deliveryIds } }, { $set: { status: statusChange } }, { multi: true });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'deliveries.downloadLabels': function downloadLabels(type) {
    check(type, String);

    const deliveries = Deliveries.find({ title: type }).fetch();

    deliveries.forEach((e) => {
      const fileName = `labels_${new Date().toDateString().pdf}_morning_${e.customerId}.pdf`;

      console.log(e);

      return generateComponentAsPDF({ component: Label, props: { title: e.title, postalCode: e.postalCode, date: e.onDate }, fileName })
        .then(result => result)
        .catch((error) => { throw new Meteor.Error('500', error); });
    });
  },
});

rateLimit({
  methods: [
    'deliveries.insert',
    'deliveries.update',
    'deliveries.batchUpdate',
  ],
  limit: 5,
  timeRange: 1000,
});
