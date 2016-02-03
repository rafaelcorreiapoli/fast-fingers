MAX_PARTICIPANTS = 5;
GAME_DURATION = 5;
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
  let user = Meteor.users.findOne(userId);



  //  create participant enrty
  let participantId = Participants.insert({
    gameId: gameId,
    userId: userId,
    nickname: user.profile.nickname,
    avatar: user.profile.avatar,
    correct: 0,
    wrong: 0,
    total: 0,
  });
  if (!participantId) throw new Meteor.Error('failed-to-create-participant');

  //  update game with new user
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

  // store that this user is currently with this participant, in this game
  Meteor.users.update({
    _id: userId
  }, {
    $set: {
      participantId: participantId,
      gameId: gameId
    }
  });

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
    gameCountdown: GAME_DURATION,
    status: 'waiting',
    characters: characters
  });
  if (!gameId) throw new Meteor.Error('failed-to-create-game');

  return gameId;
};

decreaseStartCountdown = function(gameId) {
  Games.update({
    _id: gameId
  }, {
    $inc: {
      startCountdown: -1
    },
    $set: {
      status: 'counting'
    }
  });
};

decreaseGameCountdown = function(gameId) {
  Games.update({
    _id: gameId
  }, {
    $set: {
      status: 'running'
    },
    $inc: {
      gameCountdown: -1
    }
  });
};

finishGame = function(gameId) {
  Games.update({
    _id: gameId
  }, {
    $set: {
      status: 'finished'
    }
  });
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
        console.log('aqui!');
        decreaseStartCountdown(gameId);
        let gameCountdownId = Meteor.setInterval(() => {
          let checkGame = Games.findOne({
            _id: gameId
          });

          console.log(checkGame.gameCountdown);
          if (checkGame.startCountdown > 0) { // start coundown
            console.log('start countdown');
            decreaseStartCountdown(gameId);
          } else if (checkGame.gameCountdown > 0) { // game countdown
            console.log('game countdown');
            decreaseGameCountdown(gameId);
          } else { //  game finished
            console.log('finished');
            finishGame(gameId);
            Meteor.clearInterval(gameCountdownId);
          }
        }, 1000);
      },
      input(c) {
        let user = Meteor.user();
        let participantId = user.participantId;
        let gameId = user.gameId;
        let participant = Participants.findOne(participantId);
        let game = Games.findOne(gameId);

        if (!participant) throw new Meteor.Error('participant-not-found');
        if (!game) throw new Meteor.Error('game-not-found');

        let characters = game.characters;

        let expected = characters[participant.correct];
        console.log('expected: ', expected);
        console.log('input: ', c);
        if (expected === c) {
          Participants.update({
            _id: participantId
          }, {
            $set: {
              lastInputStatus: 'correct'
            },
            $inc: {
              correct: 1,
              total: 1
            }
          });
        } else {
          Participants.update({
            _id: participantId
          }, {
            $set: {
              lastInputStatus: 'wrong'
            },
            $inc: {
              wrong: 1,
              total: 1
            }
          });
        }
      }
  });
}
