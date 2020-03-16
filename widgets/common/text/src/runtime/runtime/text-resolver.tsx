/* eslint-disable prefer-const */
import {
  React, RepeatedDataSource, DataRecord, Immutable, IMDataSourceInfo, ImmutableArray, IMUseDataSource, ImmutableObject,
  DataSourceManager, ReactRedux, IMUrlParameters, IMState, ExpressionResolverComponent, IMExpressionMap, MultipleExpressionResolveResults
} from 'jimu-core';
import * as utils from '../utils';

export type DataSourcesInfo = ImmutableObject<{ [dsId: string]: IMDataSourceInfo }>;

export type Records = { [dataSourceId: string]: DataRecord };

interface RenderFunction {
  (text: string): React.ReactNode
}

interface Props {
  repeatedDataSource: RepeatedDataSource,
  useDataSources: ImmutableArray<IMUseDataSource>;
  text: string;
  children?: RenderFunction | React.ReactNode;
}

interface ExtraProps {
  queryObject: IMUrlParameters;
}

export interface ExpressionValues {
  [expressionId: string]: string
}

export type IMExpressionValues = ImmutableObject<ExpressionValues>;


interface State {
  expression?: IMExpressionMap;
  records?: Records;
  expressionValues: IMExpressionValues;
}

export class _TextResolver extends React.PureComponent<Props & ExtraProps, State>{
  static displayName = '_TextResolver';
  dsm: DataSourceManager;

  constructor(props) {
    super(props);
    this.state = {
      expression: Immutable({}),
      records: {},
      expressionValues: Immutable({}),
    };
    this.dsm = DataSourceManager.getInstance();
    this.onExpressionResolved = this.onExpressionResolved.bind(this);
  }

  componentDidMount() {
    const expression = utils.getAllExpressions(this.props.text);
    const repeatedDataSource = this.props.repeatedDataSource as RepeatedDataSource;
    const records = this.getRecords(repeatedDataSource);
    this.setState({ expression, records });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.text !== prevProps.text) {
      const expression = utils.getAllExpressions(this.props.text);
      this.setState({ expression });
    }
    if (this.props.repeatedDataSource !== prevProps.repeatedDataSource) {
      const repeatedDataSource = this.props.repeatedDataSource as RepeatedDataSource;
      const records = this.getRecords(repeatedDataSource);
      this.setState({ records });
    }
  }

  getRecords = (repeatedDataSource: RepeatedDataSource) => {
    const record = repeatedDataSource && repeatedDataSource.record;
    const dsid = repeatedDataSource && repeatedDataSource.dataSourceId;
    return { [dsid]: record };
  }

  resolveTextVariables = (): string => {
    let { text, queryObject } = this.props;
    const expressionValues = this.state.expressionValues;

    if (!text) {
      return '';
    }

    text = utils.replaceHtmlExpression(text, expressionValues);
    text = utils.replaceHtmlLinkHref(text, queryObject, expressionValues);
    return text;
  }

  onExpressionResolved(values: MultipleExpressionResolveResults) {
    let expressionValues = Immutable({});
    if (values) {
      Object.keys(values).forEach(key => {
        const value = values[key];
        if (value?.isSuccessful) {
          expressionValues = expressionValues.set(key, value.value);
        }
      });
    }
    this.setState({ expressionValues });
  }

  render() {
    const { useDataSources = Immutable([]), children } = this.props;
    const text = this.resolveTextVariables()
    return <React.Fragment>
      <ExpressionResolverComponent
        useDataSources={useDataSources}
        expression={this.state.expression}
        records={this.state.records}
        onChange={this.onExpressionResolved}
      ></ExpressionResolverComponent>
      {typeof children === 'function' ? (children as RenderFunction)(text) : children}
    </React.Fragment>
  }
}

const mapStateToProps = (state: IMState) => {
  return {
    queryObject: state.queryObject
  }
}

export default ReactRedux.connect<ExtraProps, {}, Props>(mapStateToProps)(_TextResolver);