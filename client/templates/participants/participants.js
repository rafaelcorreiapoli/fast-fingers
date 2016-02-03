Template.participants.helpers({
  participants() {
    return Participants.find({gameId: Template.instance().data.gameId});
  }
});

Template.participants.onCreated(function() {
  this.subscribe('participants', this.data.gameId);
});
