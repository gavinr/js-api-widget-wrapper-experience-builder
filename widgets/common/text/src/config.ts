import { ImmutableObject } from 'jimu-core';

export type VerticalAlign = 'start' | 'center' | 'end';

export interface Style {
  wrap?: boolean;
}

export type IMStyle = ImmutableObject<Style>;

export interface Config {
  placeholder?: string;
  text: string;
  style?: Style
}

export type IMConfig = ImmutableObject<Config>;


export interface WidgetState {
  showExpression?: boolean;
  isInlineEditing?: boolean;
}

export type IMWidgetState = ImmutableObject<WidgetState>;