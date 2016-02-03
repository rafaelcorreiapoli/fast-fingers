MAX_PARTICIPANTS = 5;
GAME_DURATION = 60;
COUNTDOWN_DURATION = 3;
TOTAL_PARAGRAPHS = 5;
MIN_WORDS_PER_PARAGRAPH = 25;
MAX_WORDS_PER_PARAGRAPH = 40;
URL_PREFIX = 'http://www.randomtext.me/api/gibberish/p-';
const getSync = Meteor.wrapAsync(HTTP.get);
generateText = function() {
  let url = `${URL_PREFIX}${TOTAL_PARAGRAPHS}/${MIN_WORDS_PER_PARAGRAPH}-${MAX_WORDS_PER_PARAGRAPH}`;
  try {
    let text = getSync(url);
    return TagStripper.strip(text.data.text_out);
  } catch (e) {
    throw e;
  }
};

removeUserFromGames = function(userId) {
  Participants.remove({
    userId: Meteor.userId()
  });
  Games.update({
    users: Meteor.userId()
  }, {
    $pull: {
      users: Meteor.userId()
    },
    $inc: {
      participantsCount: -1
    }
  });
};

newParticipant = function(gameId, userId) {
  let game = Games.findOne(gameId);
  // check if game exists
  if (!game) throw new Meteor.Error('game-not-found');

  // check if game is full
  if (game.participantsCount >= game.maxParticipants) {
    throw new Meteor.Error('game-is-full');
  }


  //  remove this user from any other room
  removeUserFromGames(userId);

  //  create participant enrty
  let participantId = Participants.insert({
    gameId: gameId,
    userId: userId,
    correct: 0,
    wrong: 0,
    total: 0
  });
  if (!participantId) throw new Meteor.Error('failed-to-create-participant');

  //  update game with new participant
  let result = Games.update({
    _id: gameId
  }, {
    $addToSet: {
      users: userId
    },
    $inc: {
      participantsCount: 1
    }
  });
  if (!result) throw new Meteor.Error('failed-to-update-game');

  return participantId;
};


newGame = function(ownerId) {
  //  check if user has another game running or waiting
  let gamesRunning = Games.findOne({
    ownerId: ownerId,
    status: {
      $ne: 'finished'
    }
  });
  if (gamesRunning) throw new Meteor.Error('already-has-game');

  // generate random text
  let characters = '';
  try {
    characters = generateText().split('');
  } catch (e) {
    throw new Meteor.Error('generate-text-error');
  }

  //  get ownerName, if does not have name, use Anonymous
  let ownerName = Meteor.user().profile && Meteor.user().profile.nickname || 'Anonymous';

  //  create game entry
  let gameId = Games.insert({
    ownerId: ownerId,
    ownerName: ownerName,
    participantsCount: 0,
    maxParticipants: MAX_PARTICIPANTS,
    startCountdown: COUNTDOWN_DURATION,
    gameCountdown: GAME_DURATION + COUNTDOWN_DURATION,
    status: 'waiting',
    characters: characters
  });
  if (!gameId) throw new Meteor.Error('failed-to-create-game');

  return gameId;
};

if (Meteor.isServer) {
  Meteor.methods({
    newGame(name) {
        if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
        let gameId = newGame(Meteor.userId());
        let participandId = newParticipant(gameId, Meteor.userId());
        console.log(Meteor.userId() + ' created new game.');
        return gameId;
      },
      closeWindow() {
        if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
        console.log(Meteor.userId() + ' closed browser.');
        removeUserFromGames(Meteor.userId());
      },
      leaveGame() {
        if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
        console.log(Meteor.userId() + ' left game.');
        removeUserFromGames(Meteor.userId());
        Participants.remove({
          userId: Meteor.userId()
        });
      },
      joinGame(gameId) {
        if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
        console.log(Meteor.userId() + ' joined a game');
        return newParticipant(gameId, Meteor.userId());
      },
      startGame(gameId) {
        this.unblock();
        if (!Meteor.userId()) throw new Meteor.Error('not-authorized');
        let game = Games.findOne(gameId);
        if (!game.participantsCount) throw new Meteor.Error('no-participants');
        if (game.status !== 'waiting') throw new Meteor.Error('game-not-waiting');
        if (game.ownerId !== Meteor.userId()) throw new Meteor.Error('not-owner');
        Game.update({
          _id: gameId
        }, {
          $set: {
            status: 'counting',
          }
        });

        let gameCoundownId = Meteor.setInterval(() => {
          let checkGame = Game.findOne({
            _id: gameId
          });

          if (game.gameCountdown > GAME_DURATION + COUNTDOWN_DURATION) {   // start coundown
            Game.update({
              _id: gameId
            }, {
              $inc: {
                gameCountdown: -1
              },
              $set: {
                status: 'counting'
              }
            });
          } else if (game.gameCountdown > 0 && game.gameCountdown < GAME_DURATION) {  // game countdown
            Game.update({
              _id: gameId
            }, {
              $set: {
                status: 'running'
              },
              $inc: {
                gameCountdown: -1
              }
            });
            Meteor.clearInterval(startCountdownId);
          } else if (game.countDown <= 0) {                                     //  game finished
            Game.update({
              _id: gameId
            }, {
              $set: {
                status: 'finished'
              }
            });
            Meteor.clearInterval(gameCountdownId);
          }
        }, 1000);
      }
  });
}
