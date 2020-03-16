/** @jsx jsx */
import { moduleLoader } from 'jimu-core';
import { SidebarLayoutItem } from './layout-item';
import { SidebarType, CollapseSides } from '../../config';

import { BaseSidebarLayout } from '../layout-base';

export class SidebarLayout extends BaseSidebarLayout {
  interactModule;

  constructor(props) {
    super(props);

    this.layoutItemComponent = SidebarLayoutItem;
  }

  bindSplitHandler = () => {
    if (!this.interactModule) {
      moduleLoader.loadModule('jimu-core/dnd').then((dndModule) => {
        this.interactModule = dndModule.interact;
        this.initHandler();
      });
    } else {
      this.initHandler();
    }
  }

  private initHandler() {
    const { config } = this.props;
    let dx: number;
    let dy: number;
    if (this.splitRef && config.resizable !== false && !this.interactable) {
      this.interactable = this.interactModule(this.splitRef)
        .origin('parent')
        .draggable({
          inertia: false,
          autoScroll: false,
          modifiers: [
            this.interactModule.modifiers.restrict({
              restriction: 'parent',
            }),
          ],
          startAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y',
          lockAxis: this.props.direction === SidebarType.Horizontal ? 'x' : 'y',
          onstart: (event: Interact.DragEvent) => {
            event.stopPropagation();

            if (this.props.direction === SidebarType.Horizontal) {
              dx = this.state.deltaSize;
              dy = 0;
            } else {
              dx = 0;
              dy = this.state.deltaSize;
            }
            const parentRect = this.ref.getBoundingClientRect();
            this.domSize = this.props.direction === SidebarType.Horizontal ? parentRect.width : parentRect.height;
            this.setState({
              isResizing: true,
            });
          },
          onmove: (event: Interact.DragEvent) => {
            event.stopPropagation();

            (dx += event.dx), (dy += event.dy);

            if (this.props.direction === SidebarType.Horizontal) {
              if (this.props.config.collapseSide === CollapseSides.First) {
                this.setState({
                  deltaSize: dx,
                });
              } else {
                this.setState({
                  deltaSize: -dx,
                });
              }
            } else {
              if (this.props.config.collapseSide === CollapseSides.First) {
                this.setState({
                  deltaSize: dy,
                });
              } else {
                this.setState({
                  deltaSize: -dy,
                });
              }
            }
          },
          onend: (event: Interact.DragEvent) => {
            event.stopPropagation();

            this.setState({
              isResizing: false,
            });
          },
        });
    }
  }
}
