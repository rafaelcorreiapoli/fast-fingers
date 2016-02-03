Template.participants.helpers({
  participants() {
    return Participants.find({gameId: Template.instance().data.gameId});
  },
  getAvatar() {
    return this.avatar || 'https://www.worldremit.com/images/interim/unknown-user.png';
  }
});

Template.participants.onCreated(function() {
  this.subscribe('participants', this.data.gameId);
});
