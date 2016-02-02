TOTAL_PARAGRAPHS = 5;
MIN_WORDS_PER_PARAGRAPH = 25;
MAX_WORDS_PER_PARAGRAPH = 40;
URL_PREFIX = 'http://www.randomtext.me/api/gibberish/p-';
const getSync = Meteor.wrapAsync(HTTP.get);
generateText = function() {
  let url = `${URL_PREFIX}${TOTAL_PARAGRAPHS}/${MIN_WORDS_PER_PARAGRAPH}-${MAX_WORDS_PER_PARAGRAPH}`;
  try {
    let text = getSync(url);
    return text;
  } catch (e) {
    throw e;
  }
};


if (Meteor.isServer) {
  Meteor.methods({
    createGame(name) {
      if (!Meteor.userId()) throw new Meteor.Error('not-authorized');

      let characters;
      try {
        characters = generateText().split('');
        Games.insert({
          ownerId: Meteor.userId(),
          ownerName: Meteor.user().profile.name,
          participantsCount: 0,
          status: 'waiting',
          characters: characters
        });
      } catch (e) {
        throw new Meteor.Error('generate-text-error');
      }
    }
  });
}
