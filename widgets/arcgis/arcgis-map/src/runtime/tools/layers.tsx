import {React, classNames} from 'jimu-core';
import {BaseTool, BaseToolProps, IconType} from '../layout/base/base-tool';
import {loadArcGISJSAPIModules, JimuMapView} from 'jimu-arcgis';
import {defaultMessages} from 'jimu-ui';
import {Nav, NavItem, NavLink} from 'jimu-ui';

interface States {
  activeTabIndex: number;
}

export default class Layers extends BaseTool<BaseToolProps, States> {
  toolName = 'Layers';

  constructor(props) {
    super(props);
    this.state = {
      activeTabIndex: 0
    }
  }

  getTitle() {
    return this.props.intl.formatMessage({id: 'LayersLabel', defaultMessage: defaultMessages['LayersLabel']});
  }

  getIcon(): IconType {
    return {
      icon: require('../assets/icons/layerlist.svg')
    };
  }

  getExpandPanel(): JSX.Element {
    return <div style={{width: this.props.isMobile ? '100%' : '250px', minHeight: '32px', position: 'relative'}}
      className={classNames({'exbmap-ui-pc-expand-maxheight': !this.props.isMobile})}>
      <Nav tabs>
        <NavItem>
          <NavLink active={this.state.activeTabIndex === 0} onClick={() => {this.handleTabIndexChange(0)}}>
            {this.props.intl.formatMessage({id: 'LayersLabelLayer', defaultMessage: defaultMessages['LayersLabelLayer']})}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={this.state.activeTabIndex === 1} onClick={() => {this.handleTabIndexChange(1)}}>
            {this.props.intl.formatMessage({id: 'LayersLabelLegend', defaultMessage: defaultMessages['LayersLabelLegend']})}
          </NavLink>
        </NavItem>
      </Nav>
      <div className="mt-1"></div>
      {this.state.activeTabIndex === 0 && <LayerListInner jimuMapView={this.props.jimuMapView}></LayerListInner>}
      {this.state.activeTabIndex === 1 && <LegendInner jimuMapView={this.props.jimuMapView}></LegendInner>}
    </div>;
  }

  handleTabIndexChange = (activeTabIndex: number) => {
    this.setState({
      activeTabIndex: activeTabIndex
    });
  }
}

interface InnerProps {
  jimuMapView: JimuMapView;
}

interface InnerState {
  apiLoaded: boolean;
}


class LayerListInner extends React.PureComponent<InnerProps, InnerState> {
  LayerList: typeof __esri.LayerList = null;
  LayerListBtn: __esri.LayerList;
  container: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      apiLoaded: false
    }
  }

  componentDidMount() {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/LayerList']).then(modules => {
        [this.LayerList] = modules;
        this.setState({
          apiLoaded: true
        });
      })
    }
  }

  componentDidUpdate() {
    if (this.state.apiLoaded && this.container) {
      this.LayerListBtn = new this.LayerList({
        container: this.container,
        view: this.props.jimuMapView.view
      });
    }
  }

  componentWillUnmount() {
    if (this.LayerListBtn) {
      this.LayerListBtn = null;
    }
  }

  render() {
    return <div ref={ref => {this.container = ref; }} style={{width: '100%', minHeight: '32px', position: 'relative'}}>
      {!this.state.apiLoaded && <div className="exbmap-basetool-loader"></div>}
    </div>;
  }
}

class LegendInner extends React.PureComponent<InnerProps, InnerState> {
  Legend: typeof __esri.Legend = null;
  LegendBtn: __esri.Legend;
  container: HTMLElement;

  constructor(props) {
    super(props);

    this.state = {
      apiLoaded: false
    }
  }

  componentDidMount() {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules(['esri/widgets/Legend']).then(modules => {
        [this.Legend] = modules;
        this.setState({
          apiLoaded: true
        });
      })
    }
  }

  componentDidUpdate() {
    if (this.state.apiLoaded && this.container) {
      this.LegendBtn = new this.Legend({
        container: this.container,
        view: this.props.jimuMapView.view
      });
    }
  }

  componentWillUnmount() {
    if (this.LegendBtn) {
      this.LegendBtn = null;
    }
  }

  render() {
    return <div ref={ref => {this.container = ref; }} style={{width: '100%', minHeight: '32px', position: 'relative'}}>
      {!this.state.apiLoaded && <div className="exbmap-basetool-loader"></div>}
    </div>;
  }
}