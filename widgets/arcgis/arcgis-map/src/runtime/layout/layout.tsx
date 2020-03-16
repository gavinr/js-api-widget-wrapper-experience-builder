/** @jsx jsx */
import {React, ReactDOM, css, jsx, AppMode, SizeModeLayoutJson, IntlShape} from 'jimu-core';
import {ToolConfig} from '../../config';
import {LayoutJson, GroupJson, HiddenElementNames} from './config';
import Group from './base/group';
import {JimuMapView} from 'jimu-arcgis';

interface LayoutProps {
  layoutConfig: LayoutJson;
  toolConfig: ToolConfig;

  jimuMapView: JimuMapView;
  isMobile: boolean;

  appMode: AppMode;
  layouts: { [name: string]: SizeModeLayoutJson };
  LayoutEntry?: any;
  widgetManifestName: string;

  widgetHeight?: number;
  intl?: IntlShape;
}

interface LayoutState {
  activeToolName: string;

  toolsContentInMobileExpandPanel?: JSX.Element;
  hiddenElementNames: HiddenElementNames;
}

export default class Layout extends React.PureComponent<LayoutProps, LayoutState>{
  contentRef: HTMLElement;

  constructor(props){
    super(props);

    this.state = {
      activeToolName: null,
      toolsContentInMobileExpandPanel: null,
      hiddenElementNames: []
    }

    this.contentRef = document.createElement('div');
    this.contentRef.className = 'exbmap-ui esri-ui-inner-container exbmap-ui-layout';
  }

  getStyle() {
    return css`
      z-index: 0;

      .expand-panel-transition {
        transition: opacity 0.3s, right 0.3s;
      }

      .scale-attribution-xy-group {
        > div:first-of-type:nth-last-of-type(1) {
          width: 100%;
          max-width: 100% !important;
        }
      }

      .exbmap-ui-hidden-element {
        display: none !important;
      }

      .exbmap-basetool-loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        width: 100%;
        animation: esri-fade-in 500ms ease-in-out;
      }

      .exbmap-basetool-loader:before {
        background-color: rgba(110,110,110,0.3);
        width: 100%;
        z-index: 0;
        content: "";
        opacity: 1;
        position: absolute;
        height: 2px;
        top: 0;
        transition: opacity 500ms ease-in-out;
      }

      .exbmap-basetool-loader:after {
        background-color: #6e6e6e;
        width: 20%;
        z-index: 0;
        animation: looping-progresss-bar-ani 1500ms linear infinite;
        content: "";
        opacity: 1;
        position: absolute;
        height: 2px;
        top: 0;
        transition: opacity 500ms ease-in-out;
      }

      .exbmap-ui-pc-expand-maxheight {
        max-height: ${this.getMaxHeightForPcExpand(this.props.widgetHeight)}px;
        overflow: auto
      }
      `;
  }

  getMaxHeightForPcExpand = (widgetHeight: number): number => {
    if (!widgetHeight) {
      return null;
    } else {
      if (widgetHeight < 65) {
        return null;
      } else {
        const resultHeight = widgetHeight - 65;
        if (resultHeight < 300) {
          return resultHeight;
        } else {
          return 300;
        }
      }
    }
  }

  handleActiveNameChange = (activeToolName: string) => {
    this.setState({
      activeToolName: activeToolName
    });
  }

  handSetHiddenElementNames = (elementNames: HiddenElementNames) => {
    this.setState({
      hiddenElementNames: elementNames
    });
  }

  getLayoutContent = (layoutJson: LayoutJson) => {
    if (!layoutJson || !this.props.toolConfig) {
      return null;
    } else {
      return <div css={this.getStyle()}>
        {Object.keys(layoutJson.layout).map((key, index) => {
          if (!layoutJson.elements[key] || layoutJson.elements[key].type !== 'GROUP' || !layoutJson.layout[key].position) {
            return null
          }

          return <Group className={(layoutJson.elements[key] as GroupJson).className} style={(layoutJson.elements[key] as GroupJson).style}
            isResponsive={(layoutJson.elements[key] as GroupJson).isResponsive} isMobile={this.props.isMobile} isMainGroup={true}
            key={index} layoutConfig={layoutJson} toolConfig={this.props.toolConfig} onActiveToolNameChange={this.handleActiveNameChange}
            jimuMapView={this.props.jimuMapView} groupName={key} activeToolName={this.state.activeToolName}
            hiddenElementNames={layoutJson.mobileResponsiveStrategy && this.state.hiddenElementNames} intl={this.props.intl}
            onSetHiddenElementNames={this.handSetHiddenElementNames}></Group>
        })}
      </div>;
    }
  }

  componentDidMount() {
    if ((this.props.jimuMapView && this.props.jimuMapView.view && this.props.jimuMapView.view.ui && this.props.jimuMapView.view.ui.container)) {
      this.props.jimuMapView.view.ui.container.appendChild(this.contentRef);
    }
  }

  render() {
    if (this.props.jimuMapView && this.props.jimuMapView.view && this.props.jimuMapView.view.ui && this.props.jimuMapView.view.ui.container) {
      return <div>
        {ReactDOM.createPortal(this.getLayoutContent(this.props.layoutConfig), this.contentRef)}
      </div>;
    } else {
      return null;
    }
  }
}