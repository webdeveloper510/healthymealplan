import Counters from '../../api/Counters/Counters';

export function getNextSequence(sequenceName) {
  const ret = Counters.findAndModify(
    {
      query: { _id: sequenceName },
      update: {
        $inc: { seq: 1 },
      },
      new: true,
    },
  );
  return ret.seq.toString();
}

