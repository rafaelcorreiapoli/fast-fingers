AccountsTemplates.configureRoute('signIn', {
  layoutType: 'blaze',
  name: 'signIn',
  path: '/sign-in',
  template: 'signIn',
  layoutTemplate: 'plainLayout',
  contentRegion: 'main'
});

AccountsTemplates.configureRoute('signUp', {
  layoutType: 'blaze',
  name: 'signUp',
  path: '/sign-up',
  template: 'signUp',
  layoutTemplate: 'plainLayout',
  contentRegion: 'main'
});


FlowRouter.route('/', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action() {
    BlazeLayout.render('mainLayout', {main: 'home'});
  },
  name: 'home'
});

FlowRouter.route('/games', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action() {
    BlazeLayout.render('mainLayout', {main: 'games'});
  },
  name: 'games'
});

function gameRouteClose() {
  Meteor.call('leaveGame', function(err, res) {
    if (err) {
      Materialize.toast('Failed to leave game!', 5000);
    }
    Session.set('participantId', '');
  });
}
function gameRouteOpen(router) {
  console.log(router.params.id);
  
  Meteor.call('joinGame', router.params.id, function(err, res) {
    if (err) {
      FlowRouter.go('games');
      return Materialize.toast('Failed to join game!', 5000);
    }
    Session.set('participantId', res);
  });
}

FlowRouter.route('/games/:id', {
  triggersEnter: [AccountsTemplates.ensureSignedIn, gameRouteOpen.bind(this)],
  triggersExit: [gameRouteClose],
  action() {
    BlazeLayout.render('mainLayout', {main: 'game'});
  },
  name: 'game'
});
