import { esri, xss } from 'jimu-core';

const baseAttrs = ['title', 'height', 'width', 'class', 'style'];

const Sanitizer = esri.Sanitizer;
const sanitizer = new Sanitizer({
  whiteList: {
    h1: baseAttrs,
    h2: baseAttrs,
    h3: baseAttrs,
    h4: baseAttrs,
    h5: baseAttrs,
    h6: baseAttrs,
    span: baseAttrs,
    p: baseAttrs,
    s: baseAttrs,
    strong: baseAttrs,
    em: baseAttrs,
    u: baseAttrs,
    ol: baseAttrs,
    ul: baseAttrs,
    li: baseAttrs,
    a: ['href', 'target'].concat(baseAttrs),
    exp: baseAttrs
  } as any,
  safeAttrValue: function (tag, name, value, cssFilter) {
    //Custom `href` processing
    if (tag === 'a' && name === 'href') {
      return xss.escapeAttrValue(value);
    }
    return xss.safeAttrValue(tag, name, value, cssFilter);
  },
  onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
    // Allow attributes of whitelist tags start with `data-`
    if (name.substr(0, 5) === 'data-') {
      return name + '="' + xss.escapeAttrValue(value) + '"';
    }
  },
  css: {
    onIgnoreAttr: function (name, value) {
      // Allow style attr of `line-hieght`
      if (name === 'line-height') {
        return `line-height: ${xss.escapeAttrValue(value)}`;
      } else {
        return '';
      }
    }
  }
}, true);

export { sanitizer };