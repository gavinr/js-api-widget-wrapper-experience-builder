/** @jsx jsx */
import {React, css, jsx, polished, classNames, ReactDOM, ErrorBoundary, ReactResizeDetector, IntlShape} from 'jimu-core';
import {Icon, Popper, MobilePanelManager} from 'jimu-ui';
import {UIComponent, UIComponentProps} from './ui-component';
import {ToolJson} from '../config';
import ScrollContainer from './scroll-container';
import PanelShell from './panel-shell';

export interface BaseToolProps extends UIComponentProps {
  toolJson: ToolJson;
  toolName: string;
  isMobile?: boolean;
  intl?: IntlShape;

  activeToolName: string;
  onActiveToolNameChange: (activeToolName: string) => void;
}

export interface IconType {
  icon: React.ComponentClass<React.SVGAttributes<SVGElement>>,
  onIconClick?: (evt?: React.MouseEvent<any>) => void;
}

const defaultIcon = require('jimu-ui/lib/icons/widgets.svg');
const closeIcon = require('../../assets/icons/close-12.svg');

export abstract class BaseTool<P extends BaseToolProps , S extends {}> extends UIComponent<P, S>{
  iconContainer: HTMLElement;
  toolName: string = null;
  isContainedToMobilePanel = false;
  // this param is used to update pop position when pc content has changed
  generation?: number = 0;

  constructor(props){
    super(props);

    const mapContainer = this.props.jimuMapView && this.props.jimuMapView.view && this.props.jimuMapView.view.container;
    if (MobilePanelManager.getInstance().checkDomIsContained(mapContainer)) {
      this.isContainedToMobilePanel = true;
    }
  }

  private _cssStyle() {
    return css`
      pointer-events: auto;
      box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      position: relative;

      .exbmap-ui-tool-icon {
        fill: black;
        left: 8px;
        top: 8px;
        position: absolute;
        display: block;
      }

      .exbmap-ui-tool-icon-selected {
        color: #000;
        background-color: #eee;
      }

      .exbmap-ui-tool-icon-selected:after {
        width: 0;
        height: 0;
        border-top: 6px solid #000;
        border-left: 6px solid transparent;
        position: absolute;
        top: 0;
        right: 0;
        content: "";
        margin-top: 1px;
        margin-right: 1px;
      }

      .exbmap-ui-expand-content {
        transition: opacity 250ms ease-in-out, margin 250ms ease-in-out;
        min-height: 10px;
        min-width: 10px;
        padding-top: ${polished.rem(10)};
        padding-bottom: ${polished.rem(10)};
        padding-left: ${polished.rem(20)};
        padding-right: ${polished.rem(20)};

        .exbmap-ui-expand-content-header {
          margin-bottom: ${polished.rem(10)};
        }

        .panel-title {
          font-size: ${polished.rem(16)};
          color: #000000;
        }

        .panel-icon {
          cursor: pointer;
          color: #6e6e6e;
        }

        .panel-icon: hover {
          color: #2e2e2e;
        }
      }

      .expand-placement-bottom {
        padding-top: 0.25rem !important;
      }

      .expand-placement-left {
        padding-right: 0.25rem !important;
      }

      .expand-placement-right {
        padding-left: 0.25rem !important;
      }

      .expand-placement-top {
        padding-bottom: 0.25rem !important;
      }
      `;
  }

  abstract getTitle(): string;

  abstract getIcon(): IconType;

  abstract getExpandPanel(): JSX.Element;

  onShowPanel(){}

  onClosePanel(){}

  destroy(){}

  static getIsNeedSetting () {
    return true;
  }

  private _onIconClick (e: React.MouseEvent<any>) {
    const onIconClick = this.getIcon() && this.getIcon().onIconClick;
    if (onIconClick) {
      onIconClick(e);
    }

    if (!this.getExpandPanel()) {
      return;
    }

    if (!this.isContainedToMobilePanel) {
      MobilePanelManager.getInstance().closePanel();
    }

    if (this.props.activeToolName) {
      if (this.props.activeToolName === this.toolName) {
        this.props.onActiveToolNameChange(null);
      } else {
        this.props.onActiveToolNameChange(this.toolName);
        this.onShowPanel();
      }
    } else {
      this.props.onActiveToolNameChange(this.toolName);
      this.onShowPanel();
    }
  }

  private _getContent = () => {
    if (this.props.toolJson.isOnlyExpanded) {
      return <div css={this._cssStyle()} className="exbmap-ui exbmap-ui-tool-panel">
        <ErrorBoundary>
          {this.getExpandPanel()}
        </ErrorBoundary>
      </div>;
    } else {
      if (this.props.isMobile) {
        return this._renderMobileTool();
      } else {
        return this._renderPCTool();
      }
    }
  }

  private _initIconContainer(ref: HTMLElement) {
    if (ref && !this.iconContainer) {
      this.iconContainer = ref;
      this.forceUpdate();
    }
  }

  private onResize = (width, height) => {
    if (!width || !height) {
      return;
    }

    this.generation = height;
    this.forceUpdate();
  }

  private _renderPCTool() {
    let toolIcon = this.getIcon();
    if (!toolIcon) {
      toolIcon = {
        icon: defaultIcon,
        onIconClick: () => {}
      } as IconType;
    }

    const expandPanel = this.getExpandPanel();
    return <div className="exbmap-ui exbmap-ui-tool" css={this._cssStyle()} style={{width: '32px', height: '32px'}}>
      <div style={{}} ref={ref => {this._initIconContainer(ref); }} className={classNames('exbmap-ui-tool border-0 esri-widget--button', {
        'exbmap-ui-tool-icon-selected': this.toolName === this.props.activeToolName && expandPanel
      })}
      title={this.props.toolJson.isShowIconTitle ? this.getTitle() : ''} onClick={e => {this._onIconClick(e)}}>
        <Icon width={16} height={16} className="exbmap-ui-tool-icon" icon={toolIcon.icon}/>
      </div>
      {this.iconContainer && (this.toolName === this.props.activeToolName && expandPanel) && <PanelShell onDestroyed={() => {this.onClosePanel(); }}>
        <Popper reference={this.iconContainer} open={!!(this.toolName === this.props.activeToolName && expandPanel)}  placement={this.props.toolJson.panelPlacement}
          modifiers={{
            flip: {padding: 0},
            preventOverflow: {
              padding: 15,
              boundariesElement: this.props.jimuMapView.view.container
            }
          }} generation={this.generation}>
          <div className={this.getExpandPanelPlacementClassName()}>
            <div className="exbmap-ui-expand-content" style={{backgroundColor: 'white'}}>
              <div className="w-100 justify-content-between d-flex exbmap-ui-expand-content-header">
                <div className="panel-title text-truncate" style={{width: '210px'}} title={this.getTitle()}>
                  {this.getTitle()}
                </div>
                <div onClick={() => {this.props.onActiveToolNameChange(null); }}>
                  <Icon className="panel-icon" width={20} height={20} icon={closeIcon}/>
                </div>
              </div>
              <ErrorBoundary>
                {expandPanel}
                <ReactResizeDetector handleHeight onResize={this.onResize} />
              </ErrorBoundary>
            </div>
          </div>
        </Popper></PanelShell>}
    </div>
  }

  private _renderMobileTool() {
    let toolIcon = this.getIcon();
    if (!toolIcon) {
      toolIcon = {
        icon: defaultIcon,
        onIconClick: () => {}
      } as IconType;
    }

    const expandPanel = this.getExpandPanel();
    return <div className="exbmap-ui exbmap-ui-tool" css={this._cssStyle()}>
      <div style={{}} ref={ref => {this.iconContainer = ref; }} className={classNames('exbmap-ui-tool border-0 esri-widget--button', {
        'exbmap-ui-tool-icon-selected': this.toolName === this.props.activeToolName && expandPanel
      })}
      title={this.props.toolJson.isShowIconTitle ? this.getTitle() : ''} onClick={e => {this._onIconClick(e)}}>
        <Icon width={16} height={16} className="exbmap-ui-tool-icon" icon={toolIcon.icon}/>
      </div>
      {this.toolName === this.props.activeToolName && expandPanel &&
        ReactDOM.createPortal(<PanelShell onDestroyed={() => {this.onClosePanel(); }}><div className="w-100 h-100 d-flex flex-column">
          <div className="w-100 justify-content-between d-flex exbmap-ui-expand-content-header" style={{padding: '10px', fontWeight: 'bold'}}>
            <div className="panel-title text-truncate w-100" title={this.getTitle()}>{this.getTitle()}</div>
            <div style={{zIndex: 1, pointerEvents: 'auto', width: '40px', height: '30px'}} onClick={() => {this.props.onActiveToolNameChange(null); }}
              className="d-flex justify-content-end align-items-start">
              <Icon className="panel-icon" width={20} height={20} icon={closeIcon} color={'#6e6e6e'}/>
            </div>
          </div>
          <div className="flex-grow-1 w-100" style={{position: 'relative'}}>
            <ScrollContainer className="w-100 h-100" style={{position: 'absolute', paddingLeft: '10px', paddingRight: '10px'}}>
              <ErrorBoundary>
                {this.getExpandPanel()}
              </ErrorBoundary>
            </ScrollContainer>
          </div>
        </div></PanelShell>, document.getElementById(`${this.props.jimuMapView.id}-bottom-panel`)
        )
      }
    </div>
  }

  private getExpandPanelPlacementClassName() {
    if (!this.props.toolJson.panelPlacement) {
      return null;
    } else {
      return `expand-placement-${this.props.toolJson.panelPlacement.split('-')[0]}`;
    }
  }

  render() {
    return this._getContent();
  }
}