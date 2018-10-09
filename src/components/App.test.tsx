import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { mount, ReactWrapper } from "enzyme";
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';

describe('App', () => {
  let wrapper: ReactWrapper;
  const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
  );

  beforeEach(() => {
    wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(wrapper.getElement(), div);
    ReactDOM.unmountComponentAtNode(div);
  });
});