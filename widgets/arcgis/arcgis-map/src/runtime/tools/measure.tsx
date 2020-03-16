import {React, classNames} from 'jimu-core';
import {Icon} from 'jimu-ui';
import {BaseTool, BaseToolProps, IconType} from '../layout/base/base-tool';
import {loadArcGISJSAPIModules, JimuMapView} from 'jimu-arcgis';
import {Nav, NavItem, NavLink, defaultMessages} from 'jimu-ui';

type MeasureType = (__esri.DistanceMeasurement2D | __esri.AreaMeasurement2D | __esri.DirectLineMeasurement3D | __esri.AreaMeasurement3D);

interface States {
  activeTabIndex: number;
  measureInstances: MeasureType[];
}

export default class Measure extends BaseTool<BaseToolProps, States> {
  toolName = 'Measure';
  measureModules2D = [{
    name: 'Line',
    title: 'Line',
    path: 'DistanceMeasurement2D',
    src: require('../assets/icons/measure-distance.svg')
  }, {
    name: 'Polygon',
    title: 'Polygon',
    path: 'AreaMeasurement2D',
    src: require('../assets/icons/measure-area.svg')
  }];

  measureModules3D = [{
    name: 'Line',
    title: 'Line',
    path: 'DirectLineMeasurement3D',
    src: require('../assets/icons/measure-distance.svg')
  }, {
    name: 'Polygon',
    title: 'Polygon',
    path: 'AreaMeasurement3D',
    src: require('../assets/icons/measure-area.svg')
  }];


  constructor(props) {
    super(props);

    this.state = {
      activeTabIndex: 0,
      measureInstances: [null, null]
    };
  }

  getTitle() {
    return this.props.intl.formatMessage({id: 'MeasureLabel', defaultMessage: defaultMessages['MeasureLabel']});
  }

  getIcon(): IconType {
    return {
      icon: require('../assets/icons/measure.svg')
    };
  }

  destroy() {
    for (let i = 0; i < this.state.measureInstances.length; i++) {
      if (this.state.measureInstances[i] && !(this.state.measureInstances[i] as any).destroyed) {
        (this.state.measureInstances[i] as any).destroy();
      }
    }
  }

  handleMeasurceInstanceCreated = (measurceInstance: MeasureType, activeTabIndex: number) => {
    const measureInstances = this.state.measureInstances;
    measureInstances[activeTabIndex] = measurceInstance;
    this.setState({
      measureInstances: measureInstances
    });
  }

  onTabClick = (index: number) => {
    if (this.state.activeTabIndex === index) {
      return;
    } else {
      this.setState({activeTabIndex: index});
      for (let i = 0; i < this.state.measureInstances.length; i++) {
        if (i !== index && this.state.measureInstances[i]) {
          (this.state.measureInstances[i] as any).visible = false;
        }

        if (i === index && this.state.measureInstances[i]) {
          (this.state.measureInstances[i] as any).visible = true;
        }
      }
    }
  }

  onClosePanel = () => {
    for (let i = 0; i < this.state.measureInstances.length; i++) {
      if (this.state.measureInstances[i]) {
        (this.state.measureInstances[i] as any).visible = false;
      }
    }
  }

  onShowPanel = () => {
    for (let i = 0; i < this.state.measureInstances.length; i++) {
      if (i !== this.state.activeTabIndex && this.state.measureInstances[i]) {
        (this.state.measureInstances[i] as any).visible = false;
      }

      if (i === this.state.activeTabIndex && this.state.measureInstances[i]) {
        (this.state.measureInstances[i] as any).visible = true;
      }
    }
  }

  getExpandPanel(): JSX.Element {
    if (this.props.jimuMapView.view.type === '2d') {
      return <div style={{width: this.props.isMobile ? '100%' : '250px', position: 'relative'}}
        className={classNames({'exbmap-ui-pc-expand-maxheight': !this.props.isMobile})}>
        <Nav tabs>{
          this.measureModules2D.map((module, index) => {
            return <NavItem key={index}>
              <NavLink active={this.state.activeTabIndex === index} onClick={() => {this.onTabClick(index)}}>
                <Icon width={16} height={16} className="" icon={module.src}/>
              </NavLink>
            </NavItem>
          })}
        </Nav>
        <MeasureInner activeTabIndex={this.state.activeTabIndex} jimuMapView={this.props.jimuMapView} measureModule={this.measureModules2D[this.state.activeTabIndex]}
          measureInstance={this.state.measureInstances[this.state.activeTabIndex]} onMeasurceInstanceCreated={this.handleMeasurceInstanceCreated}></MeasureInner>
      </div>
    } else if (this.props.jimuMapView.view.type === '3d') {
      return <div style={{width: this.props.isMobile ? '100%' : '250px', position: 'relative'}}
        className={classNames({'exbmap-ui-pc-expand-maxheight': !this.props.isMobile})}>
        <Nav tabs>{
          this.measureModules3D.map((module, index) => {
            return <NavItem key={index}>
              <NavLink active={this.state.activeTabIndex === index} onClick={() => {this.onTabClick(index)}}>
                <Icon width={16} height={16} className="" icon={module.src}/>
              </NavLink>
            </NavItem>
          })}
        </Nav>
        <MeasureInner activeTabIndex={this.state.activeTabIndex} jimuMapView={this.props.jimuMapView} measureModule={this.measureModules3D[this.state.activeTabIndex]}
          measureInstance={this.state.measureInstances[this.state.activeTabIndex]} onMeasurceInstanceCreated={this.handleMeasurceInstanceCreated}></MeasureInner>
      </div>
    } else {
      return null;
    }
  }
}

interface MeasureInnerProps {
  jimuMapView: JimuMapView;
  measureModule: {name: string; title: string; path: string};
  measureInstance: MeasureType;
  activeTabIndex: number;

  onMeasurceInstanceCreated: (instance: MeasureType, activeTabIndex: number) => void;
}

interface MeasureInnerState {
  apiLoaded: boolean;
}

class MeasureInner extends React.PureComponent<MeasureInnerProps, MeasureInnerState> {
  MeasureClass: typeof __esri.DistanceMeasurement2D | typeof __esri.AreaMeasurement2D | typeof __esri.DirectLineMeasurement3D | typeof __esri.AreaMeasurement3D;
  MeasureInstance: MeasureType = null;

  parentContainer: HTMLElement;
  container: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      apiLoaded: false
    }
  }

  componentDidMount() {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/' + this.props.measureModule.path]).then(modules => {
        [this.MeasureClass] = modules;
        this.setState({
          apiLoaded: true
        });
      })
    }
  }

  componentDidUpdate(prevProps: MeasureInnerProps) {
    if (prevProps.activeTabIndex !== this.props.activeTabIndex || prevProps.measureModule !== this.props.measureModule) {
      this.reload();
      return;
    }

    if (this.state.apiLoaded && this.parentContainer && this.container) {
      if (!this.props.measureInstance) {
        const tempInstance = new this.MeasureClass({
          container: this.container,
          view: this.props.jimuMapView.view
        });
        tempInstance.viewModel.newMeasurement();

        this.props.onMeasurceInstanceCreated(tempInstance, this.props.activeTabIndex);
      } else {
        this.parentContainer.innerHTML = '';
        this.parentContainer.appendChild(this.props.measureInstance.container as HTMLElement);
        if ((this.props.measureInstance.viewModel as any).state !== 'measured' && (this.props.measureInstance.viewModel as any).state !== 'measuring') {
          this.props.measureInstance.viewModel.newMeasurement();
        }
      }
    }
  }

  reload() {
    this.setState({
      apiLoaded: false
    }, () => {
      loadArcGISJSAPIModules(['esri/widgets/' + this.props.measureModule.path]).then(modules => {
        [this.MeasureClass] = modules;
        this.setState({
          apiLoaded: true
        });
      })
    })
  }

  render() {
    return <div className="w-100" style={{width: '250px', position: 'relative', minHeight: '32px'}} ref={ref => {this.parentContainer = ref; }}>
      <div ref={ref => {this.container = ref; }}>
        {!this.state.apiLoaded && <div className="exbmap-basetool-loader"></div>}
      </div></div>
  }
}