import {React} from 'jimu-core';
import {BaseTool, BaseToolProps, IconType} from '../layout/base/base-tool';
import {loadArcGISJSAPIModules, JimuMapView} from 'jimu-arcgis'; 

export default class Attribution extends BaseTool<BaseToolProps, {}> {
  toolName = 'Attribution';

  constructor(props) {
    super(props);
  }

  static getIsNeedSetting () {
    return false;
  }

  getTitle() {
    return 'Attribution';
  }

  getIcon(): IconType {
    return null;
  }

  getExpandPanel(): JSX.Element {
    return <AttributionInner jimuMapView={this.props.jimuMapView}></AttributionInner>;
  }
}

interface AttributionInnerProps {
  jimuMapView: JimuMapView;
}

interface AttributionInnerState {
  apiLoaded: boolean;
}


class AttributionInner extends React.PureComponent<AttributionInnerProps, AttributionInnerState> {
  Attribution: typeof __esri.Attribution = null;
  AttributionBtn: __esri.Attribution;
  container: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      apiLoaded: false
    }
  }

  componentDidMount() {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/Attribution']).then(modules => {
        [this.Attribution] = modules;
        this.setState({
          apiLoaded: true
        });
      })
    }
  }

  componentDidUpdate() {
    if (this.state.apiLoaded && this.container) {
      this.AttributionBtn = new this.Attribution({
        container: this.container,
        view: this.props.jimuMapView.view
      });
    }
  }

  componentWillUnmount() {
    if (this.AttributionBtn) {
      this.AttributionBtn.destroy();
      this.AttributionBtn = null;
    }
  }

  render() {
    return <div style={{position: 'relative'}} ref={ref => {this.container = ref; }}></div>;
  }


}