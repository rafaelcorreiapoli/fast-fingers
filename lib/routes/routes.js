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
    BlazeLayout.render('mainLayout', {main: 'gamesList'});
  }
});


FlowRouter.route('/games/:id', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  action() {
    BlazeLayout.render('mainLayout', {main: 'game'});
  }
});
