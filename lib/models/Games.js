Games = new Mongo.Collection('games');

Games.Schema = new SimpleSchema({
  ownerId: {
    type: String,
    autoform: {
      omit: true
    }
  },
  ownerName: {
    type: String,
    autoform: {
      omit: true
    }
  },
  participants: {
    type: [String],
    autoform: {
      omit: true
    }
  },
  participantsCount: {
    type: Number,
    autoform: {
      omit: true
    }
  },
  status: {
    type: String,
    allowedValues: ['waiting', 'running', 'finised'],
    autoform: {
      omit: true
    },
  },
  characters: {
    type: String,
    autoform: {
      omit: {
        true
      }
    }
  }
});
