Participants = new Mongo.Collection('participants');

Participants.Schema = new SimpleSchema({
  userId: {
    type: String
  },
  correct: {
    type: Number
  },
  wrong: {
    type: Number
  },
  total: {
    type: Number
  }
})