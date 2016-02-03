Meteor.publish('participants', function(gameId) {
  // is user logged in?
  if (!this.userId) throw new Meteor.Error('not-authorized');

  // is the user also participant ?
  let participant = Participants.findOne({
    gameId: gameId,
    userId: this.userId
  });
  if (!participant) throw new Meteor.Error('not-participant');

  // return all participants from that game
  return Participants.find({
    gameId: gameId
  });
});


/*  // does the game exsists and is not finished ?
  let game = Games.findOne({
    _id: gameId,
    status: {
      $ne: 'finished'
    }
  });
  if (!game) throw new Meteor.Error('game-not-available');*/