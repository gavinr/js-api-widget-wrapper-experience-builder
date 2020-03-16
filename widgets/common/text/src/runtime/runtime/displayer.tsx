/** @jsx jsx */
import { React, jsx, RepeatedDataSource, ImmutableArray, IMUseDataSource } from 'jimu-core';
import TextResolver from './text-resolver';
import TextRenderer from './text-renderer';

interface Props {
  parentHeight?: number;
  text: string;
  placeholder?: string;
  repeatedDataSource: RepeatedDataSource,
  useDataSources: ImmutableArray<IMUseDataSource>;
}


export default class Displayer extends React.PureComponent<Props>{
  static displayName = 'Displayer';

  renderProps = (text: string) => {
    const { placeholder, parentHeight } = this.props;
    return <TextRenderer text={text} parentHeight={parentHeight} placeholder={placeholder} />
  }

  render() {
    const { text, useDataSources, repeatedDataSource } = this.props;

    return <TextResolver
      text={text}
      useDataSources={useDataSources}
      repeatedDataSource={repeatedDataSource}>
      {this.renderProps}
    </TextResolver>
  }

}