import * as React from 'react';
import { BaseField, InputGenerator } from '../../models/BaseField';
import { registerField } from '../InputGenerator';
import { InputNumber } from './InputNumber';

export class NumberInput extends BaseField {

  public static type = 'number';

  public type = 'number';

  public placeholder?: string;

  // The amount of number that will be used to increment/decrement the value
  public step: number;

  // Max value that the input can have
  public max: number;

  // Min value that the input can have
  public min: number;

  // Renders only the value, not the input field.
  public preview?: boolean;

  public render = render;

  constructor(id: string, title: string, placeholder?: string, description?: string, step: number = 1, min: number = -Infinity, max: number = Infinity) {
    super();
    this.id = id;
    this.title = title;
    this.placeholder = placeholder;
    this.description = description;
    this.step = step;
    this.min = min;
    this.max = max;
  }

  public showPreview(): BaseField {
    this.preview = true;
    return this;
  }
}

// component generator
const render: InputGenerator = (
  field: BaseField,
  value: any,
  errors: any[],
  disabled: boolean,
  onFieldChange: (field: BaseField, value: any) => void,
  onFieldBlur: (field: BaseField) => void,
) => <InputNumber
  disabled={disabled}
  field={field as NumberInput}
  errors={errors}
  onChange={(v: any) => onFieldChange(field, v)}
  onBlur={() => onFieldBlur(field)}
  value={value}
/>;

// register 'number' field for json form generations
registerField('number', render);