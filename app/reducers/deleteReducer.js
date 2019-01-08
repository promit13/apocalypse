import { ACTION_DELETE } from '../actions/types';

const deleteEpisodeReducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_DELETE: {
      return { message: action.payload };
    }
    default:
      return state;
  }
};

export default deleteEpisodeReducer;
