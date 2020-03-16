import { css } from 'jimu-core';

// By default, we are pulling the latest Avenir Next fonts from CDN
export const getFontFaces = () => {
  return css`
    @import url('//webapps-cdn.esri.com/CDN/fonts/v1.4.1/fonts.css');
  `
}