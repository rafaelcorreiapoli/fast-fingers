Template.games.onCreated(function() {
  this.subscribe('games.list');
  this.isLoading = new ReactiveVar(false);
});

Template.games.helpers({
  games() {
      return Games.find();
    },
    onJoinGame() {
      return function(game) {
        FlowRouter.go('game', {
          id: game._id
        });
      };
    },
    isLoading() {
      return Template.instance().isLoading.get();
    }
});

Template.games.events({
  'click #new-game': function(e, t) {
    t.isLoading.set(true);
    Meteor.call('newGame', function(err, res) {
      t.isLoading.set(false);
      if (err) {
        console.log(err);
        return Materialize.toast('Failed to create game!', 5000);
      }

      FlowRouter.go('game', {
        id: res
      });
    });
  }
});
