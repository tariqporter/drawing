import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { shallow, ShallowWrapper } from "enzyme";
import PixelateImage from './PixelateImage.Container';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../../reducers';

describe('App', () => {
  let wrapper: ShallowWrapper;
  const store = createStore(
    rootReducer,
    applyMiddleware(thunk)
  );

  beforeEach(() => {
    wrapper = shallow(<PixelateImage store={store} />).dive();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(wrapper.getElement(), div);
    ReactDOM.unmountComponentAtNode(div);
  });
});