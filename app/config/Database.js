import Realm from 'realm';


// class ExerciseLengthAndKey extends Realm.Object {}
// ExerciseLengthAndKey.schema = {
//   name: 'ExerciseLengthAndKey',
//   primaryKey: 'id',
//   properties: {
//     length: 'int',
//     id: 'string',
//   },
// };

class SavedEpisodes extends Realm.Object {}
SavedEpisodes.schema = {
  name: 'SavedEpisodes',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    category: 'string',
    description: 'string',
    exerciseLengthList: 'int?[]',
    exerciseIdList: 'string?[]',
    exerciseDetail: { type: 'list', objectType: 'SavedExercises' },
  },
};

class SavedExercises extends Realm.Object {}
SavedExercises.schema = {
  name: 'SavedExercises',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: 'string',
    // image: 'string',
    // path: 'string',
  },
};

export default new Realm({ schema: [SavedEpisodes, SavedExercises] });
