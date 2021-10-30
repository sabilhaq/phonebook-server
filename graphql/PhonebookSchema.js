const { buildSchema } = require('graphql');
const serviceAccount = require('/home/sabil/Downloads/phonebook-710fe-firebase-adminsdk-p87by-160871680c.json');
const services = require('../services');

const schema = buildSchema(`
  input PhonebookInput {
    name: String!
    phone: String
  }

  scalar Date

  type Phonebook {
    id: String!
    name: String!
    phone: String
    createdAt: Date
    updatedAt: Date
  }

  type Query {
    getPhonebooks(page: Int!, offset: Int, limit: Int, name: String, phone: String): [Phonebook]
  }

  type Mutation {
    createPhonebook(input: PhonebookInput): Phonebook
    updatePhonebook(id: String!, input: PhonebookInput): Phonebook
    deletePhonebook(id: String!): Phonebook
  }
`);

const root = {
  getPhonebooks: async (queryStringObj) => {
    try {
      const phonebooks = await services.getPhonebooks(queryStringObj);
      return phonebooks;
    } catch (err) {
      throw err;
    }
  },
  createPhonebook: async ({ input }) => {
    try {
      const phonebook = await services.createPhonebook(input);
      return phonebook;
    } catch (err) {
      throw err;
    }
  },
  updatePhonebook: async ({ id, input }) => {
    try {
      const phonebook = await services.updatePhonebook(id, input);
      return phonebook;
    } catch (err) {
      throw err;
    }
  },
  deletePhonebook: async ({ id }) => {
    try {
      const phonebook = await services.deletePhonebook(id);
      return phonebook;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = { schema, root };
