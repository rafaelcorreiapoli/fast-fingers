Meteor.publish('games.list', function() {
  if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
  return Games.find().fetch();
});
