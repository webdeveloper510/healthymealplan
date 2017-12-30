const Jobs = JobCollection("coreJobQueue");

Jobs.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Jobs.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Jobs;
