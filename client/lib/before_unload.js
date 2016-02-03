window.onbeforeunload = function(e) {
  Meteor.call('closeWindow');
};
