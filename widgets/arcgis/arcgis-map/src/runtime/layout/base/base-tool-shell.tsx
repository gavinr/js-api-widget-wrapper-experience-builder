/** @jsx jsx */
import {jsx, classNames, IntlShape} from 'jimu-core';
import {UIComponent, UIComponentProps} from './ui-component';
import {ToolConfig} from '../../../config';
import {BaseTool, BaseToolProps} from './base-tool';
import {LayoutJson, ToolJson} from '../config';
import ToolModules from '../tool-modules';

interface ToolShellProps extends UIComponentProps {
  layoutConfig: LayoutJson;
  toolConfig: ToolConfig;
  toolName: string;
  isMobile?: boolean;
  isHidden?: boolean;
  intl?: IntlShape;
  isLastElement?: boolean;

  className?: string;
  activeToolName: string;
  onActiveToolNameChange: (activeToolName: string) => void;
}

export default class BaseToolShell extends UIComponent<ToolShellProps, {}>{

  constructor(props){
    super(props);
  }

  componentDidMount() {
    const baseToolInstance = this.refs.baseToolInstance as BaseTool<BaseToolProps, {}>;

    if(!ToolModules[this.props.toolName].getIsNeedSetting() || (this.props.toolConfig && this.props.toolConfig[`can${this.props.toolName}`])) {
      (this.props.jimuMapView.view.ui as any).exbMapTools[this.props.toolName] = baseToolInstance;
    }
  }

  componentWillUnmount() {
    if (ToolModules[this.props.toolName].getIsNeedSetting()) {
      const tempInstance =  this.props.jimuMapView && this.props.jimuMapView.view 
        && this.props.jimuMapView.view.ui && (this.props.jimuMapView.view.ui as any).exbMapTools[this.props.toolName];
      if (tempInstance && tempInstance.destroy) {
        tempInstance.destroy();
        delete (this.props.jimuMapView.view.ui as any).exbMapTools[this.props.toolName];
      }
    }
  }

  render() {
    const ToolClass = ToolModules[this.props.toolName];
    if (ToolClass) {
      return <div className={classNames(`${this.props.className} exbmap-ui exbmap-ui-tool-shell divitem`, (this.props.layoutConfig.elements[this.props.toolName] as ToolJson).className, 
        {
          'exbmap-ui-hidden-element': this.props.isHidden,
          'mb-0 mr-0': this.props.isLastElement          
        })}>
        <ToolClass ref="baseToolInstance" toolJson={this.props.layoutConfig.elements[this.props.toolName]} toolName={this.props.toolName} isMobile={this.props.isMobile}
          jimuMapView={this.props.jimuMapView} activeToolName={this.props.activeToolName} onActiveToolNameChange={this.props.onActiveToolNameChange}
          intl={this.props.intl}></ToolClass>
      </div>
    } else {
      if (this.props.isMobile) {
        return <span></span>;
      } else {
        return null;
      }
    }
  }
}