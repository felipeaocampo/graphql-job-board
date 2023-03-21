import { Job, Company } from './db.js';

function rejectIf(condition) {
  if (condition) {
    throw new Error(`Unauthorized`);
  }
}

export const resolvers = {
  Query: {
    jobs: () => Job.findAll(),
    job: (root, { id }) => Job.findById(id),
    company: (root, { id }) => Company.findById(id),
  },
  Mutation: {
    createJob: (root, { input }, { user }) => {
      rejectIf(!user);

      user.companyId;
      return Job.create({ ...input, companyId: user.companyId });
    },
    deleteJob: async (root, { id }, { user }) => {
      rejectIf(!user);

      const job = await Job.findById(id);

      if (job.companyId === user.companyId) {
        return Job.delete(id);
      } else {
        throw new Error(`Cannot delete another company's job!`);
      }
    },
    updateJob: async (root, { input }, { user }) => {
      rejectIf(!user);

      const job = await Job.findById(input.id);

      rejectIf(user.companyId !== job.companyId);

      return Job.update({ ...input, companyId: user.companyId });
    },
  },

  Company: {
    jobs: ({ id }) => Job.findAll((job) => job.companyId === id),
  },

  Job: {
    company: ({ companyId }) => Company.findById(companyId),
  },
};
