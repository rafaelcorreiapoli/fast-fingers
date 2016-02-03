Meteor.publish('games.list', function() {
  if (!this.userId) throw new Meteor.Error('not-authorized');
  return Games.find();
});

Meteor.publish('games.single', function(gameId) {
  if (!this.userId) throw new Meteor.Error('not-authorized');

  return [
    Games.find({
      _id: gameId
    }),
    Participants.find({
      gameId: gameId
    })
  ];
});

