Meteor.publish('userData', function() {
  return Meteor.users.find({
    _id: this.userId
  }, {
    fields: {
      participantId: 1,
      gameId: 1
    }
  });
});
