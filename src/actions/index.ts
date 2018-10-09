import { pixelateImage, getImageData } from "../reducers/drawing";

export const Actions = {
  ON_MY_FIELD_CHANGE: 'ON_MY_FIELD_CHANGE',
  UPDATE_PIXEL_DATA: 'UPDATE PIXEL DATA',
  GET_PIXEL_DATA: 'GET_PIXEL_DATA',
  PIXELATE_IMAGE: 'PIXELATE_IMAGE'
};

export const onChangeAction = (name: string, value: string) => ({
  type: Actions.ON_MY_FIELD_CHANGE,
  name,
  value
});

// export const getImageDataAction = (imageSrc: string) => {
//   return (dispatch: any) => {
//     return getImageData(imageSrc).drawing.then((imageData: ImageData) => {
//       dispatch(updateImageDataAction(imageData, imageSrc));
//       return imageData;
//     });
//   };
// };

export const updateImageDataAction = (imageData: ImageData, imageSrc: string) => ({
  type: Actions.UPDATE_PIXEL_DATA,
  imageData,
  imageSrc
});

export const pixelateImageAction = (imageData: ImageData, size: number) => {
  return (dispatch: any) => {
    const destImageData = pixelateImage(imageData, size);
    return new Promise((resolve, reject) => {
      dispatch({type: Actions.PIXELATE_IMAGE, destImageData});
      resolve(destImageData);
    });
  };
};

// export const pixelateImageAction = (size: number) => ({
//   type: Actions.PIXELATE_IMAGE,
//   size
// });

