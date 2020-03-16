/** @jsx jsx */
/* eslint-disable prefer-const */
import { React, jsx, css, urlUtils, ReactRedux, IMState, AppMode, classNames, jimuHistory, ReactResizeDetector } from 'jimu-core';
import { LinkTip, LinkTarget, isModifiedEvent } from 'jimu-ui';
import { sanitizer } from '../sanitizer';

interface Props {
  parentHeight?: number;
  text: string;
  placeholder?: string;
}

interface ExtraProps {
  liveView: boolean;
}

interface State {
  showLinkTip?: boolean;
  linkNode?: HTMLLinkElement;
  linkHref?: string;
  height: number;
}

export class _TextRenderer extends React.PureComponent<Props & ExtraProps, State>{
  static displayName = '_TextRenderer';
  node: React.RefObject<HTMLDivElement>;

  constructor(props) {
    super(props);
    this.state = {
      height: 0
    };
    this.node = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  isOutOrTopTargetLink = (href: string, target?: LinkTarget): boolean => {
    const isWebAddress = urlUtils.isAbsoluteUrl(href);
    const isTopTarget = target === '_top';
    return isWebAddress || isTopTarget;
  }

  handleClick(evt: React.MouseEvent<HTMLDivElement | HTMLLinkElement>) {
    const target = evt.target as HTMLLinkElement;

    if (target.nodeName !== 'A') {
      return;
    }

    const href = target.getAttribute('href');
    const linkTarget = target.target as LinkTarget;

    if (this.props.liveView && this.isOutOrTopTargetLink(href, linkTarget)) {
      evt.preventDefault();
      this.setState({ linkHref: target.href, linkNode: target });
      this.setState({ showLinkTip: true }, () => setTimeout(() => this.setState({ showLinkTip: false }), 3000));
      return;
    }

    if (
      !evt.defaultPrevented && evt.button === 0 && (!linkTarget || linkTarget === '_self') && !isModifiedEvent(evt) &&
      !urlUtils.isAbsoluteUrl(href)
    ) {
      evt.preventDefault();
      if (!href) {
        return;
      }
      jimuHistory.browserHistory.push(href);
    }

  }

  getStyle = () => {
    return css`
      width: 100%;
      height: fit-content;
      .ql-runtime {
        width: 100%;
        height: auto;
      }
    `;
  }

  isBlank(text: string) {
    /**
     * In editor, we treat both '<p></p>', '<p>\uFEFF</p>' and '<p><br></p>' as blanks
     */
    return !text || text === '<p></p>' || text === '<p>\uFEFF</p>' || text === '<p><br></p>';
  }

  getNodeText = () => {
    return this.node.current && this.node.current.textContent;
  }

  onResize(_, height: number) {
    this.setState({ height });
  }

  render() {
    let { text, placeholder, parentHeight } = this.props;
    if (this.isBlank(text) && placeholder) {
      text = placeholder;
    }
    const showTitle = parentHeight ? this.state.height > parentHeight : false;
    const { showLinkTip, linkHref, linkNode } = this.state;
    const sanitizedHtml = sanitizer.sanitize(text)
    return <div css={this.getStyle()} className="ql-container" title={showTitle ? this.getNodeText() : ''}>
      <ReactResizeDetector handleHeight onResize={this.onResize}></ReactResizeDetector>
      <div
        ref={this.node}
        className={classNames('ql-runtime')}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        onClick={this.handleClick}></div>
      {/* We only need to display link tip in Builder */}
      {showLinkTip && <LinkTip open={showLinkTip} href={linkHref} reference={linkNode} />}
    </div>;
  }

}

const mapStateToProps = (state: IMState) => {
  const isInBuilder = state.appContext.isInBuilder;
  const appMode = state.appRuntimeInfo.appMode;
  const liveView = isInBuilder && appMode === AppMode.Run;

  return {
    liveView
  }
}

export default ReactRedux.connect<ExtraProps, {}, Props>(mapStateToProps)(_TextRenderer);