function pad2(number) {
  return (number < 10 ? '0' : '') + number;
}
Template.game.onCreated(function() {
  this.autorun(() => {
    this.subscribe('games.single', FlowRouter.getParam('id'));
  });
});
Template.game.helpers({
  game() {
    return Games.findOne({
      _id: FlowRouter.getParam('id')
    });
  },
  getDate(number) {
    return new Date(0, 0, 0, 0, 0, number);
  }
});

Template.game.events({
  'click #start-game': function() {
    Meteor.call('startGame', FlowRouter.getParam('id'));
  }
})
