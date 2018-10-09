import * as React from 'react';
//import './PixelateImage.css';

export const styles = {
  root: {
    display: 'inline-block',
    verticalAlign: 'top'
  },
  // canvas: {
  //   position: 'absolute' as 'absolute',
  //   top: '0'
  // }
};

export default (props: any) => {
  const { canvasRef, mouseChange, classes } = props;  //state

  return (
    <div className={classes.root}>
      <canvas className={classes.canvas} onMouseEnter={mouseChange} onMouseLeave={mouseChange} ref={canvasRef} />
    </div>
  );
}