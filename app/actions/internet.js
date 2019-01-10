import { CHANGE_CONNECTION_STATUS } from './types';

const connectionState = (status) => {
  return { type: CHANGE_CONNECTION_STATUS, isConnected: status };
};
export default connectionState;
