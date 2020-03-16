/** @jsx jsx */
import { React, jsx, ImmutableArray, IMUseDataSource, appActions, getAppStore, IMState, Immutable, ReactRedux, IntlShape, injectIntl, css, ThemeVariables } from 'jimu-core';
import { defaultMessages } from 'jimu-ui';
import { Editor, Delta, RichTextEditor, Formats, Sources, Bubble, Expression, RenderPlugin } from 'jimu-ui/rich-text-editor';
import * as utils from '../utils';
import { mixinFormats } from '../../utils';
import { IMConfig } from '../../config';
import { sanitizer } from '../sanitizer';

const imageMatcher = (node, delta: Delta) => {
  return { ops: [], length: 0 };
}

const modules = {
  toolbar: false,
  autoformat: {
    link: {
      trigger: /[\s]/,
      find: /https?:\/\/[\S]+|(www\.[\S]+)/gi,
      transform: function (value, noProtocol) {
        return noProtocol ? 'http://' + value : value;
      },
      format: 'link'
    }
  },
  clipboard: {
    matchers: [
      ['img', imageMatcher]
    ]
  }
};

interface OwnProps {
  widgetId: string;
  enabled?: boolean;
  useDataSources: ImmutableArray<IMUseDataSource>;
  onEditorCreate?: (editor: Editor) => void;
  onEditorDestory?: () => void;
  text: string;
  placeholder: string;
  persistPartialConfig: (config: Partial<IMConfig>) => void;
}

interface ExtraProps2 {
  intl: IntlShape;
}

interface ExtraProps {
  theme: ThemeVariables;
  showExpression?: boolean;
}

interface State {
  html?: string,
  placeholder?: string,
}

export class _Editor extends React.PureComponent<OwnProps & ExtraProps & ExtraProps2, State> {
  editor: Editor;
  expressionHeaderPorps: any;
  plugins: RenderPlugin[];
  constructor(props) {
    super(props);
    this.state = {
      html: ''
    }
    this.onEditorTextChange = this.onEditorTextChange.bind(this);
    this.handleQuillCreate = this.handleQuillCreate.bind(this);
    this.mixinFormats = this.mixinFormats.bind(this);
    this.isEditingPlaceholder = this.isEditingPlaceholder.bind(this);
    this.renderBubble = this.renderBubble.bind(this);
    this.renderExpression = this.renderExpression.bind(this);

    this.expressionHeaderPorps = {
      show: true,
      text: this.translate('dynamicContent'),
      onClose: () => this.onExpressionStateChange(false)
    }

    this.plugins = [
      this.renderBubble, this.renderExpression
    ]
  }

  componentDidMount() {
    const { text, placeholder } = this.props;
    this.setState({ html: text, placeholder });
  }

  translate = (id: string) => {
    const { intl } = this.props;
    return intl ? intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : '';
  }

  mixinFormats(formats: Formats = {}): Formats {
    const { theme } = this.props;
    formats = mixinFormats(theme, formats);
    return formats
  }

  getStyle = () => {
    const { useDataSources } = this.props;
    const dsids = utils.getInvalidDataSourceIds(this.state.html, useDataSources);
    let expressionStyles;
    if (dsids) {
      expressionStyles = dsids.map(dsid => {
        return css`
          exp[data-dsid*="${dsid}"] {
            opacity: 0.5;
            background: red;
            outline: 1px solid white;
          }
        `;
      });
    }
    return css`${expressionStyles}`;
  }

  setEditorContents = (text: string) => {
    const editor = this.editor;
    if(!editor) return;
    text = sanitizer.sanitize(text);
    editor.setContents(editor.clipboard.convert(text), 'silent');
  }

  componentDidUpdate(prevProps: OwnProps & ExtraProps) {
    const { enabled } = this.props;
    if ((!enabled && (enabled != prevProps.enabled))) {
      const text = this.persistPartialConfig();
      if (this.isPlaceholderInEditor(text, this.state.placeholder)) {
        this.setEditorContents(this.state.placeholder);
      }
    }
    /**
     * When inline editing is `first activated`, `text` is empty and `placeholder` are set,
     * We clear the text and add a zero width space `\uFEFF` to inherit the style of placeholder
     */
    if (enabled && !prevProps.enabled) {
      if (this.isPlaceholderInEditor(this.props.text, this.state.placeholder)) {
        const editor = this.editor;
        let plaintext = editor.getText() || '';
        plaintext = plaintext.trim();
        const placeholder = this.state.placeholder.replace(plaintext, '\uFEFF');
        this.setEditorContents(placeholder);
        editor.focus();
      }
    }
  }

  componentWillUnmount() {
    if (this.props.onEditorDestory) {
      this.props.onEditorDestory();
    }
    this.persistPartialConfig();
    this.editor = null;
  }

  persistPartialConfig = (): string => {
    if (this.state.html !== this.props.text || this.state.placeholder !== this.props.placeholder) {
      let config = Immutable({}) as IMConfig;
      config = config.set('text', this.state.html).set('placeholder', this.state.placeholder);
      this.props.persistPartialConfig(config);
      return this.state.html;
    }
    return this.props.text;
  }

  onExpressionStateChange = (showExpression: boolean) => {
    const { widgetId } = this.props;
    getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'showExpression', showExpression));
  }

  isEditingPlaceholder() {
    const { enabled, text } = this.props;
    return !enabled && this.isBlank(text);
  }

  onEditorTextChange(html: string, _, source: Sources) {
    if (source === 'silent') return;
    if (this.isEditingPlaceholder()) {
      this.setState({ placeholder: html });
    } else {
      this.setState({ html });
    }
  }

  isBlank(text: string) {
    /**
     * In editor, we treat both '<p></p>', '<p>\uFEFF</p>' and '<p><br></p>' as blanks
     */
    return !text || text === '<p></p>' || text === '<p>\uFEFF</p>' || text === '<p><br></p>';
  }

  isPlaceholderInEditor(text: string, placeholder: string) {
    return this.isBlank(text) && placeholder;
  }

  handleQuillCreate(editor: Editor) {
    this.editor = editor;
    const { text } = this.props;
    const placeholder = this.state.placeholder || this.props.placeholder;
    /**
     * When we first initialized editor, `text` is empty and `placeholder` are set
     * We paste the placeholder into the editor
     */
    if (this.isPlaceholderInEditor(text, placeholder)) {
      this.setEditorContents(placeholder);
    }
    this.props.onEditorCreate(editor);
  }

  renderBubble(editor: Editor, index: number) {
    return <Bubble key={index} editor={editor} mixFormats={this.mixinFormats} source="user" ></Bubble>
  }

  renderExpression(editor: Editor, index: number) {
    const { useDataSources, showExpression } = this.props;
    return <Expression
      key={index}
      source="user"
      editor={editor}
      open={showExpression}
      dataSourceIds={utils.getDataSourceIds(useDataSources)}
      header={this.expressionHeaderPorps}
    ></Expression>
  }

  render() {
    const { enabled, onEditorDestory } = this.props;
    const text = sanitizer.sanitize( this.props.text);
    return <RichTextEditor
      css={this.getStyle()}
      modules={modules}
      enabled={enabled}
      plugins={this.plugins}
      preserveWhitespace={true}
      onEditorCreate={this.handleQuillCreate}
      onEditorDestory={onEditorDestory}
      onEditorTextChange={this.onEditorTextChange}
      defaultValue={text}
    />;
  }
}

const mapStateToProps = (state: IMState, ownProps: OwnProps) => {
  const widgetState = state.widgetsState[ownProps.widgetId] || Immutable({});
  const showExpression = !!widgetState.showExpression;
  return {
    theme: state.theme,
    showExpression
  }
}

export const RichEditor = ReactRedux.connect<ExtraProps, {}, OwnProps>(mapStateToProps)(injectIntl(_Editor));