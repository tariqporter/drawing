import * as React from "react";
import { connect } from "react-redux";
// import CssBaseline from '@material-ui/core/CssBaseline';
import PixelateImage from "./PixelateImage/PixelateImage.Container";

export class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <React.Fragment>
        {/* <CssBaseline /> */}
        <div>
          <PixelateImage />
          <PixelateImage />
          <PixelateImage />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: any) => ({
  // myProperty: state.myProperty
});

const mapDispatchToProps = (dispatch: any, ownProps: any) => ({
  // myFunc: () => dispatch(myFunc(ownProps.property))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
