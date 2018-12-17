import { ACTION_DOWNLOAD } from '../actions/types';

const download = (state = {}, action) => {
  switch (action.type) {
    case ACTION_DOWNLOAD: {
      return action.payload;
    }
    default:
      return state;
  }
};

export default download;
