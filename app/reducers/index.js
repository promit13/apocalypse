import { combineReducers } from 'redux';
import download from './download';
import { deleteEpisodeReducer, deleteEpisodeListReducer } from './deleteReducer';

export default combineReducers({
  download,
  deleteEpisodeReducer,
  deleteEpisodeListReducer,
});
