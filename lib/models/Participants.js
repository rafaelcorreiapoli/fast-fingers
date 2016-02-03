Participants = new Mongo.Collection('participants');

Participants.Schema = new SimpleSchema({
  gameId: {
    type: String,
    index: 1
  },
  userId: {
    type: String,
    index: 1
  },
  nickname: {
    type: String
  },
  avatar: {
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
  },
  lastInputStatus: {
    type: String,
    allowedValues: ['correct', 'wrong']
  }
});
