/** @jsx jsx */
import { React, jsx, css, classNames, injectIntl, IntlShape, ImmutableArray, IMState, ReactRedux, IMThemeVariables, polished } from 'jimu-core';
import { FontFamily, Indent, Size, LinkNode, ListValue, FormatType, Formats, RichTextFormatKeys, EditorLinkValue, TextThemeColorPicker } from 'jimu-ui/rich-text-editor';
import { Icon, Button, NumericInput, ButtonGroup, defaultMessages, AlignValue } from 'jimu-ui';
import { SettingRow } from 'jimu-ui/setting-components';

const textIcon = require('jimu-ui/lib/icons/uppercase.svg');
const fillIcon = require('jimu-ui/lib/icons/fill.svg');
const boldIcon = require('jimu-ui/lib/icons/bold.svg');
const italicIcon = require('jimu-ui/lib/icons/italic.svg');
const underlineIcon = require('jimu-ui/lib/icons/underscore.svg');
const strikeIcon = require('jimu-ui/lib/icons/strike-through.svg');
const leftIcon = require('jimu-ui/lib/icons/align-left.svg');
const centerIcon = require('jimu-ui/lib/icons/align-middle.svg');
const rightIcon = require('jimu-ui/lib/icons/align-right.svg');
const justifyIcon = require('jimu-ui/lib/icons/align-justify.svg');
const bulletIcon = require('jimu-ui/lib/icons/text-dots.svg');
const orderedIcon = require('jimu-ui/lib/icons/text-123.svg');
const linkIcon = require('jimu-ui/lib/icons/link.svg');

const DEFAULTLETTERSIZE = '0px';
const DEFAULLINESTACE = 1.5;

export interface FormatsNodePorps {
  className?: string;
  style?: any;
  dataSourceIds?: ImmutableArray<string>;
  formats?: Formats;
  onChange?: (key: RichTextFormatKeys, value: any, type: FormatType, id?: string) => void;
  disableLink?: boolean;
  disableIndent?: boolean;
}

interface ExtraProps {
  intl?: IntlShape,
  appTheme: IMThemeVariables
}

interface State {
  openLink: boolean;
}

export class _FormatsNode extends React.PureComponent<FormatsNodePorps & ExtraProps, State> {
  static defaultProps: Partial<FormatsNodePorps & ExtraProps> = {
    formats: {},
    onChange: () => { }
  }

  constructor(props) {
    super(props);
    this.state = {
      openLink: false
    }
  }

  getStyle = () => {
    return css`
      > * {
        user-select: none;
      }
      .jimu-widget-setting--row {
        margin-top: ${polished.rem(12)}
      }
    `;
  }

  translate = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id;
  }

  handleListChange = (value: ListValue) => {
    const { formats } = this.props;
    const list = formats.list === value ? false : value;
    this.props.onChange(RichTextFormatKeys.List, list, FormatType.BLOCK)
  }

  handleLinkChange = (key: RichTextFormatKeys, value: EditorLinkValue, type: FormatType) => {
    this.props.onChange(key, value, type);
    this.toggleLinkOpen();
  }

  toggleLinkOpen = () => {
    this.setState({ openLink: !this.state.openLink })
  }

  handleLinespaceChange = (evt: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    const value = +evt.currentTarget.value;
    this.props.onChange(RichTextFormatKeys.Linespace, value, FormatType.BLOCK)
  }

  render() {
    const { className, style, formats, dataSourceIds, onChange, disableLink, disableIndent, appTheme } = this.props;
    return <div css={this.getStyle()} style={style} className={classNames(className, 'format-panel')}>
      <SettingRow>
        <div className="d-flex align-items-center justify-content-between w-100">
          <FontFamily style={{ width: '61%' }} font={formats.font} onChange={v => onChange(RichTextFormatKeys.Font, v, FormatType.INLINE)}></FontFamily>
          <Size style={{ width: '35%' }} value={formats.size} onChange={v => onChange(RichTextFormatKeys.Size, v, FormatType.INLINE)}></Size>
        </div>
      </SettingRow>

      <SettingRow>
        <div className="d-flex align-items-center justify-content-between w-100">
          <ButtonGroup size="sm">
            <Button title={this.translate('bold')} active={!!formats[RichTextFormatKeys.Bold]} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Bold, !formats[RichTextFormatKeys.Bold], FormatType.INLINE)}>
              <Icon size={12} icon={boldIcon}></Icon>
            </Button>
            <Button title={this.translate('italic')} active={!!formats[RichTextFormatKeys.Italic]} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Italic, !formats[RichTextFormatKeys.Italic], FormatType.INLINE)}>
              <Icon size={12} icon={italicIcon}></Icon>
            </Button>
            <Button title={this.translate('strike')} active={!!formats[RichTextFormatKeys.Strike]} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Strike, !formats[RichTextFormatKeys.Strike], FormatType.INLINE)}>
              <Icon size={12} icon={strikeIcon}></Icon>
            </Button>
            <Button title={this.translate('underline')} active={!!formats[RichTextFormatKeys.Underline]} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Underline, !formats[RichTextFormatKeys.Underline], FormatType.INLINE)}>
              <Icon size={12} icon={underlineIcon}></Icon>
            </Button>
          </ButtonGroup>

          <div className="d-flex align-items-center justify-content-between" style={{ width: '50%' }}>
            <TextThemeColorPicker specificTheme={appTheme} title={this.translate('highlight')}
              value={formats.background} icon={fillIcon} onChange={v => onChange(RichTextFormatKeys.Background, v, FormatType.INLINE)}></TextThemeColorPicker>
            <TextThemeColorPicker specificTheme={appTheme} title={this.translate('fontColor')}
              value={formats.color} icon={textIcon} onChange={v => onChange(RichTextFormatKeys.Color, v, FormatType.INLINE)}></TextThemeColorPicker>
            <Button style={{width: 42}} title={this.translate('link')} disabled={disableLink} active={!!formats[RichTextFormatKeys.Link]} icon size="sm"
              onClick={this.toggleLinkOpen}>
              <Icon size={12} icon={linkIcon}></Icon>
            </Button>
            <LinkNode
              dataSourceIds={dataSourceIds}
              open={this.state.openLink}
              onClose={this.toggleLinkOpen}
              formats={formats}
              onChange={this.handleLinkChange}
              className="mr-2_5"></LinkNode>
          </div>

        </div>
      </SettingRow>

      <SettingRow>
        <div className="d-flex align-items-center justify-content-between w-100">

          <ButtonGroup>
            <Button title={this.translate('left')} active={formats.align === AlignValue.LEFT} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Align, AlignValue.LEFT, FormatType.BLOCK)}>
              <Icon size={12} icon={leftIcon}></Icon>
            </Button>
            <Button title={this.translate('center')} active={formats.align === AlignValue.CENTER} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Align, AlignValue.CENTER, FormatType.BLOCK)}>
              <Icon size={12} icon={centerIcon}></Icon>
            </Button>
            <Button title={this.translate('right')} active={formats.align === AlignValue.RIGHT} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Align, AlignValue.RIGHT, FormatType.BLOCK)}>
              <Icon size={12} icon={rightIcon}></Icon>
            </Button>
            <Button title={this.translate('justify')} active={formats.align === AlignValue.JUSTIFY} icon size="sm"
              onClick={() => onChange(RichTextFormatKeys.Align, AlignValue.JUSTIFY, FormatType.BLOCK)}>
              <Icon size={12} icon={justifyIcon}></Icon>
            </Button>
          </ButtonGroup>

          <ButtonGroup>
            <Button title={this.translate('bullet')} active={formats.list === ListValue.BULLET} icon size="sm" onClick={() => this.handleListChange(ListValue.BULLET)}>
              <Icon size={12} icon={bulletIcon}></Icon>
            </Button>
            <Button title={this.translate('numbering')} active={formats.list === ListValue.ORDERED} icon size="sm" onClick={() => this.handleListChange(ListValue.ORDERED)}>
              <Icon size={12} icon={orderedIcon}></Icon>
            </Button>
          </ButtonGroup>

          <Indent disabled={disableIndent} value={formats.indent} onClick={(value) => onChange(RichTextFormatKeys.Indent, value, FormatType.BLOCK)}></Indent>
        </div>
      </SettingRow>

      <SettingRow flow="no-wrap" label={this.translate('characterSpacing')}>
        <Size style={{ width: '35%' }} value={formats.letterspace || DEFAULTLETTERSIZE} onChange={v => onChange(RichTextFormatKeys.Letterspace, v, FormatType.INLINE)} ></Size>
      </SettingRow>

      <SettingRow flow="no-wrap" label={this.translate('lineSpacing')}>
        <NumericInput style={{ width: '35%' }} size="sm" value={formats.linespace || DEFAULLINESTACE}
          showHandlers={false} onPressEnter={this.handleLinespaceChange} onBlur={this.handleLinespaceChange}></NumericInput>
      </SettingRow>

    </div >
  }
}

const mapState = (state: IMState) => {
  return {
    appTheme: state.appStateInBuilder && state.appStateInBuilder.theme
  }
}

export const FormatsNode = ReactRedux.connect<ExtraProps, {}, FormatsNodePorps>(mapState)(injectIntl(_FormatsNode));