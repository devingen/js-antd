import { Button, Checkbox, Form, Icon, Input, Select } from 'antd';
import { MultipleChoice } from 'dvn-react-core';
import * as React from 'react';
import { convertToAlphanumeric, isNumeric, simpleTextDecorator, swapArray } from '../utils';
import { ICommonFieldProps } from './FieldForm';

const Option = Select.Option;
const FormItem = Form.Item;

export const emptyFieldData = new MultipleChoice('', '', []);

class FieldFormMultipleChoice extends React.Component<ICommonFieldProps> {

  public static defaultProps: Partial<ICommonFieldProps> = {
    data: undefined,
    disabled: false,
  };

  public handleSubmit() {
    this.props.form.validateFields((errors: any, values: any) => {
      if (errors) {
        return;
      }

      const data = {
        ...(this.props.data || emptyFieldData),
        ...values,
        type: MultipleChoice.type,
      };
      this.props.onSaveClick(data);
    });
  }

  public render() {
    const { fieldConfig, form, commonProps, data, disabled, strings } = this.props;
    const { getFieldDecorator } = form;

    const disableOptionValues = !!data;

    return (
      <Form layout="horizontal" onSubmit={() => this.handleSubmit()}>
        <FormItem {...commonProps} label={strings.field.question}>
          {simpleTextDecorator(getFieldDecorator,
            'title', strings.field.question, data ? data.title : '', true, fieldConfig.titleMin, fieldConfig.titleMax, [], strings)(
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.questionPlaceholder}
              disabled={disabled}
            />,
          )}
        </FormItem>

        <FormItem {...commonProps} label={strings.field.description}>
          {simpleTextDecorator(getFieldDecorator, 'description',
            strings.field.descriptionPlaceholder, data ? data.description : '', false, fieldConfig.descriptionMin, fieldConfig.descriptionMax, [], strings)(
            <Input.TextArea
              autosize={{ minRows: 3, maxRows: 20 }}
              autoComplete="off"
              placeholder={strings.field.descriptionPlaceholder}
              disabled={disabled}
            />,
          )}
        </FormItem>

        <FormItem {...commonProps} label={strings.field.required}>
          {getFieldDecorator('required', { initialValue: data ? data.required : true, valuePropName: 'checked' })(
            <Checkbox disabled={disabled}>{strings.field.requiredDescription}</Checkbox>,
          )}
        </FormItem>

        <FormItem {...commonProps} label={strings.field.multipleChoice.options}>

          {getFieldDecorator('options', { initialValue: data ? data.options : [] })(
            <OptionList
              disableOptionValues={disableOptionValues}
              disabled={disabled}
              strings={strings}
            />,
          )}

        </FormItem>

        <FormItem {...commonProps} label={strings.field.multipleChoice.inputType}>
          {getFieldDecorator('inputType',
            { initialValue: data ? data.inputType : 'checkbox' })(
            <Select disabled={disabled}>
              <Option value="checkbox">{strings.field.multipleChoice.inputTypeCheckbox}</Option>
              <Option value="select">{strings.field.multipleChoice.inputTypeSelect}</Option>
              <Option value="tag-cloud">{strings.field.multipleChoice.inputTypeTagCloud}</Option>
            </Select>,
          )}
        </FormItem>

        <FormItem {...commonProps} label={strings.field.multipleChoice.placeholder}>
          {simpleTextDecorator(getFieldDecorator, 'placeholder',
            strings.field.multipleChoice.placeholder, data ? data.placeholder : '', false, 3, 100, [], strings)(
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.multipleChoice.placeholderPlaceholder}
              disabled={disabled}
            />,
          )}
        </FormItem>

        <div style={{ textAlign: 'right' }}>
          <Button
            onClick={() => this.props.onCancelClick()}
            style={{ marginRight: 5 }}
            disabled={disabled}
          >
            {strings.cancel}
          </Button>
          <Button onClick={() => this.handleSubmit()}>{strings.save}</Button>
        </div>
      </Form>
    );
  }
}

export default Form.create({
  onValuesChange(props: ICommonFieldProps, changedValues: any, allValues: any) {
    if (props.onChange) {
      props.onChange({ ...(props.data || emptyFieldData), ...allValues });
    }
  },
})(FieldFormMultipleChoice);

export interface IOptionListProps {
  disableOptionValues: boolean
  disabled: boolean
  onChange?: (value: any[]) => void
  strings: any
  value?: any[]
}

export interface IOptionListState {
  optionLabel: string
  optionValue: string
}

class OptionList extends React.Component<IOptionListProps, IOptionListState> {

  /* tslint:disable:no-empty */
  public static defaultProps: Partial<IOptionListProps> = {
    onChange: () => {
    },
  };

  public state = {
    optionLabel: '',
    optionValue: '',
  };

  public optionLabelInput: any;

  public deleteOption(option: any) {
    if (this.props.disabled) {
      return;
    }

    const options = [...this.props.value!];
    options.splice(options.indexOf(option), 1);
    this.props.onChange!(options);
  }

  public onAddOptionClick() {
    const { optionLabel, optionValue } = this.state;
    if (optionLabel === '') {
      return;
    }

    let value: any = optionValue || convertToAlphanumeric(optionLabel);
    if (isNumeric(value)) {
      value = Number(value);
    }

    const options = [...this.props.value!, { label: optionLabel, value }];

    this.setState({
      optionLabel: '',
      optionValue: '',
    }, () => this.props.onChange!(options));

    this.optionLabelInput.focus();
  }

  public moveOptionUp(option: any) {
    if (this.props.disabled) {
      return;
    }

    const options = [...this.props.value!];

    for (let i = 0; i < options.length; i += 1) {
      if (options[i].value === option.value) {
        if (i === 0) {
          return;
        }

        swapArray(options, i, i - 1);
        break;
      }
    }

    this.props.onChange!(options);
  }

  public moveOptionDown(option: any) {
    if (this.props.disabled) {
      return;
    }

    const options = [...this.props.value!];

    for (let i = 0; i < options.length; i += 1) {
      if (options[i].value === option.value) {
        if (i === options.length - 1) {
          return;
        }

        swapArray(options, i, i + 1);
        break;
      }
    }

    this.props.onChange!(options);
  }

  public updateOptionLabel(option: any, label: string) {
    const options = [...this.props.value!];

    for (const o of options) {
      if (o.value === option.value) {
        o.label = label;
        break;
      }
    }

    this.props.onChange!(options);
  }

  public render() {
    const { disableOptionValues, disabled, strings, value } = this.props;

    return (
      <div>
        {value!.map((option: any) => (
          <div key={option.value} style={{ display: 'flex', marginTop: '0.3rem' }}>
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.multipleChoice.label}
              style={{ flex: isNumeric(option.value) ? 8 : 10 }}
              value={option.label}
              onChange={(e: any) => this.updateOptionLabel(option, e.target.value)}
              disabled={disabled}
            />

            {isNumeric(option.value) &&
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.multipleChoice.value}
              value={option.value}
              disabled={disabled || disableOptionValues}
              style={{ flex: 2, marginLeft: 5 }}
              onChange={(e: any) => this.setState({ optionValue: e.target.value })}
            />
            }

            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flex: 2,
                height: 32,
                justifyContent: 'space-around',
                marginLeft: 5,
              }}
            >
              <Icon
                type="close-circle"
                style={{ cursor: 'pointer' }}
                onClick={() => this.deleteOption(option)}
              />

              <Icon
                type="up"
                style={{ cursor: 'pointer' }}
                onClick={() => this.moveOptionUp(option)}
              />

              <Icon
                type="down"
                style={{ cursor: 'pointer' }}
                onClick={() => this.moveOptionDown(option)}
              />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', marginTop: '0.3rem' }}>
          <div style={{ flex: 8 }}>
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.multipleChoice.label}
              value={this.state.optionLabel}
              onChange={(e: any) => this.setState({ optionLabel: e.target.value })}
              ref={(input: any) => {
                this.optionLabelInput = input;
              }}
              onPressEnter={() => this.onAddOptionClick()}
              disabled={disabled}
            />
          </div>
          <div style={{ flex: 2, marginLeft: 5 }}>
            <Input
              type="text"
              autoComplete="off"
              placeholder={strings.field.multipleChoice.value}
              value={this.state.optionValue}
              onChange={(e: any) => this.setState({ optionValue: e.target.value })}
              onPressEnter={() => this.onAddOptionClick()}
              disabled={disabled}
            />
          </div>
          <div
            style={{
              flex: 2,
              marginLeft: 5,
            }}
          >
            <Button
              style={{ width: '100%' }}
              onClick={() => this.onAddOptionClick()}
              disabled={disabled}
            >
              {strings.add}
            </Button>
          </div>
        </div>
        <p style={{ lineHeight: '1.2em', marginTop: '0.5rem' }}>
          * {strings.field.multipleChoice.valueDescription}
        </p>
      </div>
    );
  }
}
