/** @jsx jsx */
import { React, jsx, css, lodash, ImmutableArray } from 'jimu-core';
import { FormatsNode } from './ui/formats'
import { RichTextFormatKeys, Editor, FormatType, EditorSelection, Sources, Formats as FormatsValue, richTextUtils, IMLinkParamMap } from 'jimu-ui/rich-text-editor';

interface State {
  formats: FormatsValue;
}

interface InjectProps {
  editor: Editor;
}

export type FormatsOption = {
  className?: string;
  style?: any;
  dataSourceIds?: ImmutableArray<string>;
  formats?: FormatsValue;
  source?: Sources;
  quillEnabled: boolean;
  /**
 * Some times, the fomrats we got from editor does not contain enough information.
 * For example, for expression format, we only save id in editor object, But its details
 *  are stored in the wdiegt config.
 *  So in this way, you can mix some information into formats by `mixFormats`.
 */
  mixFormats?: (formats: FormatsValue) => FormatsValue;
}

export class Formats extends React.PureComponent<FormatsOption & InjectProps, State> {
  links: IMLinkParamMap;
  static defaultProps: Partial<FormatsOption & InjectProps> = {
    source: 'user'
  }
  debounce: any;
  selection: EditorSelection;

  constructor(props) {
    super(props);
    this.state = {
      formats: {}
    }
  }

  componentDidMount() {
    const { editor, quillEnabled } = this.props;
    this.debounce = lodash.debounce(this.onEditorChange.bind(this), 100);
    editor.on('editor-change', this.debounce);
    editor.on('scroll-optimize', this.debounce);

    const formats = this.prepareFormats({});
    this.setState({ formats });
    if (!quillEnabled) {
      this.selection = this.getAllSelection(editor);
      this.updateSelectionFormats(this.selection);
    }
  }

  getStyle = () => {
    return css`
      > * {
        user-select: none;
      }
    `;
  }

  onEditorChange = () => {
    const { editor, quillEnabled } = this.props;
    const selection = quillEnabled ? editor.getSelection(false) : this.getAllSelection(editor);
    if (!selection) {
      return;
    }
    this.selection = selection;
    this.updateSelectionFormats(selection);
  }

  updateSelectionFormats = (selection: EditorSelection) => {
    const { editor } = this.props;
    let formats = editor.getFormat(selection);
    formats = this.prepareFormats(formats);
    this.setState({ formats });
  }

  prepareFormats = (formats: FormatsValue) => {
    if (this.props.mixFormats) {
      formats = this.props.mixFormats(formats);
    }
    if(formats && formats.link && formats.link.link) {
      formats = lodash.assign({}, formats, { link: formats.link.link });
    }
    formats = richTextUtils.handlingExceptionalFormats(formats);
    return formats;
  }

  getAllSelection = (editor): EditorSelection => {
    let length = editor.getLength();
    length = length > 0 ? length - 1 : length;
    return { index: 0, length };
  }

  getSelection = (): EditorSelection => {
    return this.selection;
  }

  handleChange = (key: RichTextFormatKeys, value: any, type: FormatType) => {
    const { editor, source, quillEnabled } = this.props;
    //handle range
    const selection = this.getSelection();

    const formatParams = {
      type,
      key,
      value,
      selection,
      enabled: quillEnabled,
      source
    }

    richTextUtils.formatText(editor, formatParams);
  }

  componentWillUnmount() {
    const { editor } = this.props;
    if (editor) {
      editor.off('selection-change', this.debounce);
    }
    this.debounce && this.debounce.cancel();
  }


  render() {
    const { quillEnabled, className, style, dataSourceIds } = this.props;

    const disableLink = (!this.selection || !this.selection.length) || !quillEnabled;

    return <FormatsNode
      css={this.getStyle()}
      className={className}
      style={style}
      dataSourceIds={dataSourceIds}
      disableIndent={!quillEnabled}
      disableLink={disableLink}
      formats={this.state.formats}
      onChange={this.handleChange} />
  }
}