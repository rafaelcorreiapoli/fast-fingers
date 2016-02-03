Template.gamesCard.events({
  'click #join-game': function(e, t) {
    t.data.onJoinGame(this);
  }
});
