import { CHANGE_CONNECTION_STATUS } from '../actions/types';

const internetReducer = (state, action) => {
  switch (action.type) {
    case CHANGE_CONNECTION_STATUS: {
      return { isConnected: action.payload };
    }
    default:
      return { isConnected: true };
  }
};

export default internetReducer;
