import { ACTION_DELETE, ACTION_DELETE_EPISODE } from '../actions/types';

export const deleteEpisodeReducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_DELETE: {
      return { message: action.payload };
    }
    default:
      return state;
  }
};

export const deleteEpisodeListReducer = (state = {}, action) => {
  switch (action.type) {
    case ACTION_DELETE_EPISODE: {
      return { message: action.payload };
    }
    default:
      return state;
  }
};

export default deleteEpisodeReducer;
