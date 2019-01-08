import { combineReducers } from 'redux';
import download from './download';
import deleteEpisodeReducer from './deleteReducer';

export default combineReducers({
  download,
  deleteEpisodeReducer,
});
