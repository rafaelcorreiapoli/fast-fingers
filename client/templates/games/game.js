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
    },
    joinCharacters(characters) {
      let myParticipant = Participants.findOne({
        _id: Session.get('participantId')
      });
      if (!myParticipant) return characters.join('');
      let lastPart = characters.slice();
      lastPart.splice(0, myParticipant.correct);
      let firstPart = characters.slice();
      firstPart.splice(myParticipant.correct, characters.length);

      return `<span class='correct'>${firstPart.join('')}</span>${lastPart.join('')}`;
    }
});

Template.game.events({
  'click #start-game': function() {
    Meteor.call('startGame', FlowRouter.getParam('id'));
  },
  'input #game-input': function(e) {
    let $el = $(e.target);
    let text = $el.val();
    $el.val('');
    if (text) {
      Meteor.call('input', text);
    }
  }
});
