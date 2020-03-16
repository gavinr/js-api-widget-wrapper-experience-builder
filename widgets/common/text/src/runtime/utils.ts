import { Immutable, ImmutableArray, ThemeVariables, IMUseDataSource, Expression, ExpressionPart, IMUrlParameters, LinkResult, urlUtils, IMExpressionMap } from 'jimu-core';
import { styleUtils } from 'jimu-ui';
import { Formats, IMLinkParamMap } from 'jimu-ui/rich-text-editor';
import { LinkParam } from 'jimu-ui/setting-components';
import { IMExpressionValues } from './runtime/text-resolver';

type IMUseDataSources = ImmutableArray<IMUseDataSource>;

export const expreg = /\<exp((?!\<exp).)*((?!\<exp).)*\<\/exp\>/gmi;
export const areg = /\<a((?!\<a).)*((?!\<a).)*\<\/a\>/gm;

export const expressionreg = /data-expression=\"(((?![\=|\>|\"]).)*)["\>|"\s)]/m;
export const linkreg = /data-link=\"(((?![\=|\>|\"]).)*)["\>|"\s)]/m;

export const uniqueidreg = /data-uniqueid=\"(((?![\=|\s|\>|\"]).)*)[\"\>|"\s)]/m;

export const dsidreg = /data-dsid=\"(((?![\=|\>|\"]).)*)[\"\>|"\s)]/gm;

export const hrefreg = /href="((?!").)*"/m;

export const getDataSourceIds = (useDataSources: ImmutableArray<IMUseDataSource> = Immutable([])): ImmutableArray<string> => {
  return useDataSources.map(ds => ds.dataSourceId);
}

export const getTextFormats = (theme: ThemeVariables): Formats => {
  const font = (theme && theme.typography.fontFamilyBase) || 'Avenir Next';
  const linespace = (theme && theme.typography.lineHeights.medium) || '1.5';
  const color = theme && theme.body.color; //todo header?
  let size = (theme && theme.typography.fontSizeBase) || '14px';
  size = styleUtils.remToPixel(size);
  return { font, linespace, color, size };
}

/**
 * Replace fields in uds1 with fields in uds2, if uds1 does not have a corresponding uds2, set its fields to an empty array
 * @param uds1 {dataSourceid: 'ds_1', fields: ['name'], dataSourceid: 'ds_2', fields: ['pop']}
 * @param uds2 {dataSourceid: 'ds_1', fields: ['state']}
 * @returns {dataSourceid: 'ds_1', fields: ['state'], dataSourceid: 'ds_2', fields: []}
 */
export const replaceUseDataSourcesFields = (uds1: IMUseDataSources, uds2: IMUseDataSources): IMUseDataSources => {
  if (!uds1) {
    return;
  }

  return uds1.map(uds => {
    const dsid = uds.dataSourceId;
    const dataSource = uds2 ? getUseDataSourceById(uds2, dsid) : null;
    if (!dataSource) {
      return uds.set('fields', []);
    }
    const fields = dataSource.fields;
    return uds.set('fields', fields);
  });
}

export const getUseDataSourceById = (useDataSources: IMUseDataSources, id: string): IMUseDataSource => {
  return useDataSources.filter(val => val.dataSourceId === id)[0];
}

/**
 * Capture all regular expression matching results
 * 
 * @param string 
 * @param regexp Must have a global label
 */
export const matchAll = (string: string, regexp: RegExp): string[] => {
  const strings = [];
  let matches;
  while ((matches = regexp.exec(string)) !== null) {
    strings.push(matches[0]);
  }
  return strings;
}

/**
 * Decode and parse the encoded object string as an object
 * 
 * @param encodeString %7B%22foo%22%3A1%2C%22bar%22%3A2%7D
 * @returns {foo: 1, bar: 2}
 */
export const convertEncodeObject = (encodeString: string): Expression | LinkParam => {
  try {
    encodeString = decodeURIComponent(encodeString);
    const expression = JSON.parse(encodeString);
    return expression;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Getting the data source ids from HTML strings through regular expressions
 * 
 * @param html 
 * <p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp>
 * <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 * @param regular_expressions: `dsidreg`
 * @returns ['ds_1', 'ds_2']
 */
export const getUseDataSourceIds = (html: string): string[] => {
  const regexp = dsidreg;
  let strings = [];
  let matches;
  while ((matches = regexp.exec(html)) !== null) {
    let ids = matches[1];
    if (ids.indexOf(',') > 0) {
      ids = ids.split(',');
      strings = strings.concat(ids)
    } else {
      strings.push(ids);
    }
  }
  return strings;
}

export const getInvalidDataSourceIds = (text: string, useDataSources: ImmutableArray<IMUseDataSource>): string[] => {
  const ids = this.getUseDataSourceIds(text);
  if (!ids || !ids.length) {
    return;
  }
  const uds = getDataSourceIds(useDataSources);
  const dsids = ids.filter(id => uds.indexOf(id) < 0);
  if (dsids.length) {
    return dsids;
  }
}

/**
 * Get the attribute values of data-expression from HTML strings through regular expressions and convert them to objects
 * 
 * regular_expressions: `expreg`, `expressionreg`, `uniqueidreg` 
 * @param html <p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp> abc </p>
 * @returns {e3c: {name: value}}
 */
export const getExpressions = (html: string): IMExpressionMap => {
  const exps = matchAll(html, expreg);
  let expressions = Immutable({});
  exps.forEach(exp => {
    const rets = exp.match(expressionreg);
    const uniqueids = exp.match(uniqueidreg);
    if (rets && rets[1]) {
      const encoded = rets[1];
      const expression = convertEncodeObject(encoded);
      const uniqueid = uniqueids[1];
      expressions = expressions.set(uniqueid, expression);
    }
  });
  return expressions;
}

/**
 * Get the attribute values of data-link from HTML strings through regular expressions and convert them to objects
 * 
 * regular_expressions: `areg`, `linkreg`, `uniqueidreg` 
 * @param html <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a> abc </p>
 * @returns {9721: {name: value}}
 */

export const getLinks = (html: string): IMLinkParamMap => {
  const as = matchAll(html, areg);
  let links = Immutable({});
  as.forEach(linkTagString => {
    const rets = linkTagString.match(linkreg);
    const uniqueids = linkTagString.match(uniqueidreg);
    if (rets && rets[1]) {
      const encoded = rets[1];
      const link = convertEncodeObject(encoded) as LinkParam;
      const uniqueid = uniqueids[1];
      if (!uniqueid || !link) return;
      links = links.set(uniqueid, link);
    }
  });
  return links;
}


/**
 * Get all data-expression(<exp> </exp>) attribute values and data-link.expression(<a> </a>) values from HTML strings
 * @param html
 * <p> ddd<exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp>
 * <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 * @returns  {e3c: {name: value}, 9721: {name: value}}
 */
export const getAllExpressions = (html: string): IMExpressionMap => {
  let expressions = getExpressions(html);
  const links = getLinks(html);
  for (const uniqueid in links) {
    const link = links[uniqueid];
    if (link.expression) {
      expressions = expressions.set(uniqueid, link.expression);
    }
  }

  return expressions;
}

/**
 * Get expression parts from expressions
 * @param expressions 
 */
export const getExpressionParts = (expressions: IMExpressionMap): ExpressionPart[] => {
  let parts = [];
  for (const uniqueid in expressions) {
    const expression = expressions[uniqueid];
    const iparts = expression && expression.parts;
    if (iparts) {
      parts = parts.concat(iparts);
    }
  }
  return parts;
}

/**
 * Replace <exp data-uniqueid="id_1"></exp> in HTML strings with corresponding values based on uniqueID
 * 
 * @param html <p> ddd <exp data-uniqueid="e3c" data-dsid="ds_1" data-expression="{name: value}">{Rank}</exp></p>
 * @param values {e3c: 'foo'}
 * @returns <p> ddd foo</p>
 */
export const replaceHtmlExpression = (html: string, values: IMExpressionValues) => {
  return html.replace(expreg, (exp) => {
    const ret = exp.match(uniqueidreg);
    const uniqueid = ret && ret[1];
    if (!uniqueid) {
      return exp;
    }
    const value = values[uniqueid];
    return typeof value !== 'undefined' ? value : exp;
  });
}

/**
 * Replace <a href="#" data-uniqueid="id_1"></a> in HTML strings with corresponding values based on uniqueID
 * 
 * @param html <p> ddd <a href="#" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 * @param values {9721: 'foo'}
 * @returns <p> ddd  <a href="foo" target="_blank" data-uniqueid="9721" data-dsid="ds_2" data-link="{name:value}">link</a></p>
 */
export const replaceHtmlLinkHref = (html: string, queryObject: IMUrlParameters, values: IMExpressionValues) => {
  return html.replace(areg, (tag) => {
    const ret = tag.match(uniqueidreg);
    const id = ret && ret[1];
    if (!id) {
      return tag;
    }
    let href = '';
    const objs = tag.match(linkreg);
    if (objs && objs[1]) {
      const linkstr = objs[1];
      const link = convertEncodeObject(linkstr) as LinkParam;
      const expression = link && link.expression;

      if (expression) {
        href = values[id] || '';
      } else {
        href = urlUtils.getHrefFromLinkTo(link as LinkResult, queryObject);
      }

      tag = tag.replace(hrefreg, `href="${href}"`);

      return tag;
    }

  });
}