import Realm from 'realm';

class SavedEpisodes extends Realm.Object {}
SavedEpisodes.schema = {
  name: 'SavedEpisodes',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    category: 'string',
    description: 'string',
    episodeIndex: 'int',
    seriesIndex: 'int',
    videoSize: 'string',
    totalTime: 'string',
    workoutTime: 'string',
    startWT: 'string',
    endWT: 'string',
    exerciseLengthList: 'int?[]',
    exerciseIdList: 'string?[]',
    exerciseDetail: { type: 'list', objectType: 'SavedExercises' },
  },
};

class SavedExercises extends Realm.Object {}
SavedExercises.schema = {
  name: 'SavedExercises',
  properties: {
    id: 'string',
    title: 'string',
    cmsTitle: 'string',
    episodeExerciseTitle: 'string',
    visible: 'bool',
    advanced: 'bool',
  },
};

class SavedWorkOut extends Realm.Object {}
SavedWorkOut.schema = {
  name: 'SavedWorkOut',
  primaryKey: 'episodeId',
  properties: {
    uid: 'string',
    episodeId: 'string',
    workOutLogs: { type: 'list', objectType: 'SavedWorkoutLogs' },
  },
};


class SavedWorkoutLogs extends Realm.Object {}
SavedWorkoutLogs.schema = {
  name: 'SavedWorkoutLogs',
  properties: {
    logId: 'int',
    episodeTitle: 'string',
    category: 'string',
    episodeIndex: 'int',
    seriesIndex: 'int',
    workOutTime: 'int',
    trackingStarted: 'bool',
    workOutCompleted: 'bool',
    dateNow: 'int',
    distance: 'int',
    timeInterval: 'string',
    timeStamp: 'int',
    steps: 'int',
  },
};

export default new Realm({ schema: [SavedEpisodes, SavedExercises, SavedWorkOut, SavedWorkoutLogs] });
