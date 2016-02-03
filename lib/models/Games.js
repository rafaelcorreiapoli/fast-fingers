Games = new Mongo.Collection('games');

Games.Schema = new SimpleSchema({
  ownerId: {
    type: String,
    index: 1,
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
  startCountdown: {
    type: Number,
  },
  gameCountdown: {
    type: Number
  },
  users: {
    type: [String],
    index: 1,
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
  maxParticipants: {
    type: Number,
    autoform: {
      omit: true
    }
  },
  status: {
    type: String,
    index: 1,
    allowedValues: ['waiting', 'running', 'finised'],
    autoform: {
      omit: true
    },
  },
  characters: {
    type: String,
    index: 1,
    autoform: {
      omit: {
        true
      }
    }
  }
});
