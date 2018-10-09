import * as React from 'react';
import { connect } from 'react-redux';
import PixelateImage, { styles } from './PixelateImage';
// import { pixelateImageAction } from '../../actions';
import { getImageData, Drawing, toRedFn, grayscaleImageFn } from '../../reducers/drawing';
import { withStyles } from '@material-ui/core/styles';

export class PixelateImageContainer extends React.Component<any, any> {
  private canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private timer: NodeJS.Timer;
  private pixelSize: number = 5;
  private animateTime = 200;
  private startAnimateTime: number = 0;
  private drawing: Drawing;

  constructor(props: any) {
    super(props);
    this.state = {
      size: this.pixelSize
    };
    this.mouseChange = this.mouseChange.bind(this);
    this.animate = this.animate.bind(this);
  }

  public componentDidMount() {
    // const src = './s-l300.jpg';
    const src = './dangerous.png';
    this.drawing = getImageData(src);
    this.drawing.imageData.then(imageData => {
      this.drawing
        .gaussianBlur(this.pixelSize)
        // .boxBlur(3)
        // .pixelate(this.state.size)
      // .generic([grayscaleImageFn, toRedFn])
      // .area(0, 0, imageData.width, 150)
      .drawToCanvas(this.canvasRef);
    // const mirrorImage = pixelImage.mirror();
    // pixelImage.join(mirrorImage).drawToCanvas(this.canvasRef);
    });
  }

  public animate(mouseEnter: boolean, fn: () => void) {
    let pixelImage = this.drawing;
    if (this.state.size > 1) {
      pixelImage = pixelImage.gaussianBlur(this.state.size);
    }
      
      // .pixelate(this.state.size);
    if (mouseEnter) {
      // const mirrorImage = pixelImage.mirror();
      this.drawing.imageData.then(imageData => {
        const mirrorImage = pixelImage
          .area(0, imageData.height / 2, imageData.width, imageData.height / 2)
          .mirror()
          .fade();
        pixelImage
        .join(mirrorImage)
        .drawToCanvas(this.canvasRef);
      });
    } else {
      pixelImage
        // .generic([grayscaleImageFn, toRedFn])
        .drawToCanvas(this.canvasRef);
    }

    clearTimeout(this.timer);
    this.timer = setTimeout(fn, 0);
  }

  public mouseChange(e: any) {
    this.startAnimateTime = new Date().getTime();
    const mouseEnter = e.type === 'mouseenter';
    const pixelChange = () => {
      if (mouseEnter && this.state.size <= 1 || !mouseEnter && this.state.size >= this.pixelSize) {
        return;
      }
      
      let p = (new Date().getTime() - this.startAnimateTime) / this.animateTime;
      p = p > 1 ? 1 : p;
      p = 1 - Math.pow(1 - p, 2);
      const pixelSize = mouseEnter ? 1 + this.pixelSize - Math.floor(p * this.pixelSize): 1 + Math.floor(p * this.pixelSize);
      this.setState((state: any) => ({
        size: pixelSize
      }), () => this.animate(mouseEnter, pixelChange));
    };
    pixelChange();
  }

  public render() {
    return (
      <PixelateImage {...this.props} canvasRef={this.canvasRef} mouseChange={this.mouseChange} />
    );
  }
}

const mapStateToProps = (state: any) => ({
});

const mapDispatchToProps = (dispatch: any, ownProps: any) => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(PixelateImageContainer));