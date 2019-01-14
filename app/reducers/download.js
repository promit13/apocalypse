import { ACTION_DOWNLOAD, ACTION_DOWNLOAD_PROGRESS } from '../actions/types';

const INITIAL_STATE = {
  downloadComplete: undefined,
  downloadProgress: 0,
};

const download = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTION_DOWNLOAD: {
      return { ...state, downloadComplete: action.payload, downloadProgress: 0 };
    }
    case ACTION_DOWNLOAD_PROGRESS: {
      return { ...state, downloadProgress: action.payload };
    }
    default:
      return state;
  }
};

export default download;
