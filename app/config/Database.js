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
    videoSize: 'string',
    totalTime: 'string',
    workoutTime: 'string',
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

export default new Realm({ schema: [SavedEpisodes, SavedExercises] });
