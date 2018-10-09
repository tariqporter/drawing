// import { combineReducers } from 'redux';
import { Actions } from '../actions';
// import { pixelateImage } from './drawing';
import initialState from './initialState';

function combineReducersWithMain(allReducers: any) {
  const { main, ...reducers } = allReducers;
  return (state: any, action: any) => {
    const s = main(state, action);
    Object.keys(reducers).forEach(key => {
      if (!!state && state.hasOwnProperty(key)) {
        s[key] = reducers[key](state[key], action);
      }
    });
    return s;
  }
}

export default combineReducersWithMain({
  main: mainReducer,
  destImageData
});

export function mainReducer(state = initialState, action: any) {
  switch (action.type) {
    case Actions.ON_MY_FIELD_CHANGE:
      return { ...state, [action.name]: action.value };
    case Actions.UPDATE_PIXEL_DATA:
      const { imageSrc, imageData } = action;
      return { ...state, imageSrc, imageData };
    default:
      return state;
  }
}

export function destImageData(state: ImageData, action: any) {
  switch (action.type) {
    case Actions.PIXELATE_IMAGE:
      return action.destImageData;
    default:
      return state;
  }
}