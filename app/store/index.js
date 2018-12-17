import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

// const store = createStore(
//   reducers,
//   {},
//   compose(applyMiddleware(thunk)),
// );

// export default store;

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducers);
export default store;
