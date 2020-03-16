/** @jsx jsx */
import { React, jsx, css } from 'jimu-core';
import { ClearFormatsNode, ClearFormatsPorps } from './ui/clear-formats'
import { Editor, EditorSelection, Sources, richTextUtils, RichTextFormatKeys, FormatType } from 'jimu-ui/rich-text-editor';

interface State {
  range?: EditorSelection;
}

interface InjectProps {
  editor: Editor;
}

export type ClearFormatsOption = ClearFormatsPorps & {
  source?: Sources;
  quillEnabled: boolean;
}


export class ClearFormats extends React.PureComponent<ClearFormatsOption & InjectProps, State> {
  static defaultProps: Partial<ClearFormatsOption & InjectProps> = {
    source: 'user',
    formats: {},
    onChange: () => { }
  }

  getStyle = () => {
    return css`
      > * {
        user-select: none;
      }
    `;
  }

  getAllSelection = (editor): EditorSelection => {
    let length = editor.getLength();
    length = length > 0 ? length - 1 : length;
    return { index: 0, length };
  }

  handleChange = (key: RichTextFormatKeys, value: any, type: FormatType) => {
    const { quillEnabled, editor } = this.props;
    const selection = quillEnabled ? editor.getSelection(false) : this.getAllSelection(editor);
    const source = quillEnabled ? 'user' : 'api' as Sources;
    
    const formatParams = {
      type,
      key,
      value,
      selection,
      source
    }

    richTextUtils.formatText(editor, formatParams);
  }


  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { editor, onChange, source, quillEnabled, ...others } = this.props;

    return <ClearFormatsNode
      css={this.getStyle()}
      {...others}
      onChange={this.handleChange}></ClearFormatsNode>
  }
}