import { React, IntlShape, injectIntl } from 'jimu-core';
import { Button, Icon, defaultMessages  } from 'jimu-ui';
import { FormatType, RichTextFormatKeys } from 'jimu-ui/rich-text-editor';
const clearFormatsIcon = require('jimu-ui/lib/icons/clear-formats.svg');
export interface ClearFormatsPorps {
  className?: string;
  style?: any;
  formats?: { [x: string]: any };
  onChange?: (key: RichTextFormatKeys, value: any, type: FormatType, id?: string) => void;
}

interface ExtraProps {
  intl: IntlShape
}

class _ClearFormatsNode extends React.PureComponent<ClearFormatsPorps & ExtraProps> {
  static defaultProps: Partial<ClearFormatsPorps & ExtraProps> = {
    formats: {},
    onChange: () => { }
  }

  translate = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id;
  }

  render() {
    const { onChange, className, style, formats } = this.props;
    const active = !!Object.keys(formats).length;
    return <Button
      active={active}
      className={className}
      style={style}
      icon
      type="tertiary"
      size="sm"
      onClick={() => onChange(RichTextFormatKeys.Clear, null, FormatType.INLINE)}
      title={this.translate('clearAllFormats')}>
      <Icon size={14} icon={clearFormatsIcon}></Icon>
    </Button>
  }
}

export const ClearFormatsNode = injectIntl(_ClearFormatsNode)