import { combineReducers } from 'redux';
import download from './download';
import deleteEpisodeReducer from './deleteReducer';
import internetReducer from './internetReducer';

export default combineReducers({
  download,
  deleteEpisodeReducer,
  internetReducer,
});
