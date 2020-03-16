/** @jsx jsx */
import {
  React,
  jsx,
  css,
  IMThemeVariables,
  classNames,
  IMSizeModeLayoutJson,
  polished,
  getAppStore,
  appActions,
} from 'jimu-core';
import { isPercentage, PageContext, PageContextProps } from 'jimu-layouts/common';
import { styleUtils, Loading } from 'jimu-ui';
import { IMSidebarConfig, SidebarType, CollapseSides, SidebarControllerPositions } from '../config';
import { SidebarController } from './toggle-button';

interface LayoutItemProps {
  // layoutId: string;
  // layoutItemId: string;
  itemStyle?: any;
  innerLayouts: IMSizeModeLayoutJson;
  style?: any;
  className?: string;
}

export interface SidebarProps {
  // layouts: IMSizeModeLayoutJson;
  widgetId: string;
  direction: SidebarType;
  theme: IMThemeVariables;
  config: IMSidebarConfig;
  firstLayouts: IMSizeModeLayoutJson;
  secondLayouts: IMSizeModeLayoutJson;
  sidebarVisible?: boolean;
}

interface State {
  deltaSize: number;
  isResizing: boolean;
}

const animation = css`
  transition: all 200ms;
`;

export abstract class BaseSidebarLayout extends React.PureComponent<SidebarProps, State> {
  ref: HTMLElement;
  splitRef: HTMLElement;
  domSize: number;
  interactable: Interact.Interactable;
  layoutItemComponent: React.ComponentClass<LayoutItemProps & { collapsed?: boolean }>;

  constructor(props) {
    super(props);
    const { config } = this.props;
    this.state = {
      isResizing: false,
      deltaSize: 0,
    };
    getAppStore().dispatch(appActions.widgetStatePropChange(
      this.props.widgetId,
      'collapse',
      config.defaultState !== 0,
    ));
  }

  componentDidMount() {
    const { firstLayouts, secondLayouts } = this.props;
    if (firstLayouts && secondLayouts) {
      this.bindSplitHandler();
    }
  }

  componentDidUpdate() {
    const { firstLayouts, secondLayouts } = this.props;
    if (firstLayouts && secondLayouts && !this.interactable) {
      this.bindSplitHandler();
    }
    if (this.interactable) {
      this.interactable.draggable({
        startAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y',
        lockAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y',
      });
    }
  }

  componentWillUnmount() {
    this.removeSplitHandler();
  }

  abstract bindSplitHandler: () => void;

  removeSplitHandler = () => {
    if (this.interactable) {
      this.interactable.unset();
      this.interactable = null;
    }
  }

  toggleSidebar = (e) => {
    e.stopPropagation();
    getAppStore().dispatch(appActions.widgetStatePropChange(
      this.props.widgetId,
      'collapse',
      !this.props.sidebarVisible,
    ));
  }

  calSidebarSize() {
    const { config } = this.props;
    let size;
    if (this.state.deltaSize !== 0) {
      if (isPercentage(config.size)) {
        size = `${(parseFloat(config.size) * this.domSize) / 100 + this.state.deltaSize}px`;
      } else {
        size = `${parseFloat(config.size) + this.state.deltaSize}px`;
      }
    } else {
      size = config.size;
    }
    return size;
  }

  createCollapsibleSide(layouts: IMSizeModeLayoutJson, side: CollapseSides) {
    const { config, direction } = this.props;
    const size = this.calSidebarSize();
    const shouldFlip = this.shouldFlipLeftAndRight();
    let sizeCSS;
    if (direction === SidebarType.Horizontal) {
      sizeCSS = css`
        width: ${size};
        transform: ${config.overlay && !this.props.sidebarVisible ?
    (config.collapseSide === CollapseSides.First && !shouldFlip ? `translateX(-${size})` : `translateX(${size})`) : 'none'};
        top: ${config.overlay ? 0 : 'auto'};
        bottom: ${config.overlay ? 0 : 'auto'};
        left: ${config.overlay && side === CollapseSides.First && !shouldFlip ? 0 : 'auto'};
        right: ${config.overlay && side === CollapseSides.Second && !shouldFlip ? 0 : 'auto'};
      `;
    } else {
      sizeCSS = css`
        height: ${size};
        transform: ${config.overlay && !this.props.sidebarVisible ?
    (config.collapseSide === CollapseSides.First ? `translateY(-${size})` : `translateY(${size})`) : 'none'};
        left: ${config.overlay ? 0 : 'auto'};
        right: ${config.overlay ? 0 : 'auto'};
        top: ${config.overlay && side === CollapseSides.First ? 0 : 'auto'};
        bottom: ${config.overlay && side === CollapseSides.Second ? 0 : 'auto'};
      `;
    }
    const LayoutItem = this.layoutItemComponent;
    return (
      <div
        css={css`
        ${this.state.isResizing ? '' : animation}
        ${sizeCSS}
        position: ${config.overlay ? 'absolute' : 'relative'};
        overflow: visible;
        z-index: 2;
        flex-grow: 0;
        flex-shrink: 0;
        flex-basis: auto;
      `}
        className={classNames('d-flex', {
          'flex-column': direction === SidebarType.Vertical,
        })}>
        <LayoutItem
          // layoutId={this.props.layoutId}
          // layoutItemId={side === CollapseSides.First ? '0' : '1'}
          innerLayouts={layouts}
          itemStyle={side === CollapseSides.First ? config.firstPanelStyle : config.secondPanelStyle}
          collapsed={!this.props.sidebarVisible}
          className={classNames({
            'h-100': direction === SidebarType.Vertical,
            'w-100': direction === SidebarType.Horizontal,
          })}
        />
        {this.createController(shouldFlip)}
      </div>
    );
  }

  splitStyle(isDesignMode: boolean) {
    const { theme, direction, config } = this.props;
    if (!isDesignMode &&
      (!config.divider || !config.divider.visible || !config.divider.lineStyle) && config.resizable === false) {
      return null;
    }
    const size = this.calSidebarSize();
    const collapsed = !this.props.sidebarVisible;
    const lineStyle =
      !config.divider || !config.divider.visible || !config.divider.lineStyle
        ? (isDesignMode ? `1px solid ${theme.colors.palette.light[500]}` : 'none')
        : styleUtils.toCSSBorder(config.divider.lineStyle);
    if (direction === SidebarType.Horizontal) {
      return css`
        width: 1px;
        border-left: ${lineStyle};
        position: ${config.overlay ? 'absolute' : 'relative'};
        left: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.First ? size : 'auto'};
        right: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.Second ? size : 'auto'};
        height: ${config.overlay ? '100%' : 'auto'};
        &:after {
          display: ${config.resizable !== false ? 'block' : 'none'};
          position: absolute;
          content: '';
          width: 10px;
          top: 0;
          bottom: 0;
          left: -5px;
          cursor: col-resize;
        }
        z-index: 3;
      `;
    }
    return css`
      height: 1px;
      border-top: ${lineStyle};
      position: ${config.overlay ? 'absolute' : 'relative'};
      top: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.First ? size : 'auto'};
      bottom: ${config.overlay && !collapsed && config.collapseSide === CollapseSides.Second ? size : 'auto'};
      width: ${config.overlay ? '100%' : 'auto'};
      &:after {
        display: ${config.resizable !== false ? 'block' : 'none'};
        position: absolute;
        content: '';
        height: 10px;
        top: -5px;
        right: 0;
        left: 0;
        cursor: row-resize;
      }
      z-index: 3;
    `;
  }

  createController(shouldFlip: boolean) {
    const { config, theme, direction } = this.props;
    if (config.toggleBtn && !config.toggleBtn.visible) {
      return null;
    }
    const controllStyle = !this.props.sidebarVisible ? config.toggleBtn.expandStyle : config.toggleBtn.collapseStyle;
    let top;
    let left;
    let offsetX = 0;
    let offsetY = 0;
    let posCSS;
    if (direction === SidebarType.Horizontal) {
      if (config.toggleBtn.position === SidebarControllerPositions.Start) {
        top = 0;
      } else if (config.toggleBtn.position === SidebarControllerPositions.Center) {
        top = '50%';
        offsetY = -config.toggleBtn.height / 2;
      }
      const shouldFlip = this.shouldFlipLeftAndRight();
      posCSS = css`
        top: ${config.toggleBtn.position !== SidebarControllerPositions.End ? top : 'auto'};
        bottom: ${config.toggleBtn.position === SidebarControllerPositions.End ? 0 : 'auto'};
        right: ${config.collapseSide === CollapseSides.First && !shouldFlip ? 0 : 'auto'};
        left: ${config.collapseSide === CollapseSides.Second && !shouldFlip ? 0 : 'auto'};
      `;
    } else {
      if (config.toggleBtn.position === SidebarControllerPositions.Start) {
        left = 0;
      } else if (config.toggleBtn.position === SidebarControllerPositions.Center) {
        left = '50%';
        offsetX = -config.toggleBtn.width / 2;
      }
      posCSS = css`
        left: ${config.toggleBtn.position !== SidebarControllerPositions.End ? left : 'auto'};
        right: ${config.toggleBtn.position === SidebarControllerPositions.End ? 0 : 'auto'};
        bottom: ${config.collapseSide === CollapseSides.First ? 0 : 'auto'};
        top: ${config.collapseSide === CollapseSides.Second ? 0 : 'auto'};
      `;
    }

    const { style } = controllStyle;
    const { iconSize, width, height, color, icon } = config.toggleBtn;

    return (
      <div
        css={css`
          ${posCSS}
          position: absolute;
          transform: translate(${config.toggleBtn.offsetX + offsetX}px, ${config.toggleBtn.offsetY + offsetY}px);
        `}
        onClick={this.toggleSidebar}>
        <SidebarController theme={theme} icon={icon} iconSize={iconSize} expanded={this.props.sidebarVisible}
          width={width} height={height} color={color} style={style} shouldFlip={shouldFlip} />
      </div>
    );
  }

  createNormalSide(layouts: IMSizeModeLayoutJson, side: CollapseSides) {
    const LayoutItem = this.layoutItemComponent;
    const { config } = this.props;
    return (
      <div
        css={this.state.isResizing ? '' : animation}
        className="flex-shrink-0 flex-grow-1 d-flex"
        style={{ zIndex: 0, flexBasis: !this.props.sidebarVisible ? '100%' : '0', overflow: 'auto' }}>
        <LayoutItem
          // layoutId={this.props.layoutId}
          // layoutItemId={side === CollapseSides.First ? '0' : '1'}
          itemStyle={side === CollapseSides.First ? config.firstPanelStyle : config.secondPanelStyle}
          innerLayouts={layouts}
          className="w-100"
        />
      </div>
    );
  }

  private shouldFlipLeftAndRight() {
    const { direction } = this.props;
    if (direction === SidebarType.Horizontal) {
      const isRTL = getAppStore().getState().appContext.isRTL;
      return isRTL; // TODO need to update the logic
    }
    return false;
  }

  render() {
    const { config, firstLayouts, secondLayouts, direction } = this.props;
    if (!firstLayouts || !secondLayouts) {
      return (
        <Loading/>
      );
    }

    return (<PageContext.Consumer>
      {(pageContext: PageContextProps) => {
        const builderTheme = pageContext.builderTheme;
        const borderStyle = pageContext.isDesignMode ?
          `1px dashed ${polished.rgba(builderTheme.colors.palette.dark[300], 0.3)}` : 'none';
        return <div
          className={classNames('d-flex w-100', {
            'flex-column': direction === SidebarType.Vertical,
          })}
          ref={el => (this.ref = el)}
          css={css`
            border: ${borderStyle};
            position: relative;
            overflow: hidden;
            justify-content: ${config.collapseSide === CollapseSides.First ? 'flex-end' : 'flex-start'};
          `}>
          {/* left side */}
          {config.collapseSide === CollapseSides.First
            ? this.createCollapsibleSide(firstLayouts, CollapseSides.First)
            : this.createNormalSide(firstLayouts, CollapseSides.First)}
          <div css={this.splitStyle(pageContext.isDesignMode)} ref={el => (this.splitRef = el)} />
          {/* right side */}
          {config.collapseSide === CollapseSides.Second
            ? this.createCollapsibleSide(secondLayouts, CollapseSides.Second)
            : this.createNormalSide(secondLayouts, CollapseSides.Second)}
        </div>;
      }}
    </PageContext.Consumer>);
  }
}
