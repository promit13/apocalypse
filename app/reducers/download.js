import { ACTION_DOWNLOAD, ACTION_DOWNLOAD_PROGRESS, ACTION_DOWNLOAD_CANCEL } from '../actions/types';

const INITIAL_STATE = {
  downloadComplete: undefined,
  downloadProgress: 0,
  showCancel: undefined,
};

const download = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case ACTION_DOWNLOAD: {
      return { ...state, downloadComplete: action.payload, downloadProgress: 0 };
    }
    case ACTION_DOWNLOAD_PROGRESS: {
      return { ...state, downloadProgress: action.payload };
    }
    case ACTION_DOWNLOAD_CANCEL: {
      return { ...state, showCancel: action.payload };
    }
    default:
      return state;
  }
};

export default download;
