import { Mongo } from 'meteor/mongo';

import Counters from '../../api/Counters/Counters';

export function getNextSequence(order) {
  const ret = Counters.findAndModify(
    {
      query: { _id: order },
      update: { $inc: { seq: 1 } },
      new: true,
    },
  );
  return ret.seq.toString();
}

