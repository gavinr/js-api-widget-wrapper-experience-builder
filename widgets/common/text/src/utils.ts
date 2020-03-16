import { ThemeVariables, lodash } from 'jimu-core';
import { styleUtils } from 'jimu-ui';
import { Formats } from 'jimu-ui/rich-text-editor';

export const getTextFormats = (theme: ThemeVariables): Formats => {
  const font = (theme && theme.typography.fontFamilyBase) || 'Avenir Next';
  const linespace = (theme && theme.typography.lineHeights.medium) || '1.5';
  const color = theme && theme.body.color; //todo in header?
  let size = (theme && theme.typography.fontSizeBase) || '14px';
  size = styleUtils.remToPixel(size);
  return { font, linespace, color, size };
}


export const mixinFormats = (theme: ThemeVariables, formats: Formats = {}): Formats => {
  const themeFormats = this.getTextFormats(theme);
  formats = lodash.assign({}, themeFormats, formats);
  return formats
}