import { Icon, Modal } from 'antd';
import * as cn from 'classnames';
import * as React from 'react';
import { colors } from '../../constants';
import { FormData } from '../../form/Form';
import { IBaseInput, IBaseInputProps } from '../IBaseInput';
import { RatingStars } from '../RatingStars';
import { SingleChoice } from '../SingleChoice';
import { TextInput } from '../TextInput';
import { getStrings } from './defaultStrings';

import FieldDisplay from './FieldDisplays/FieldDisplay';
import FieldFormDialog from './FieldFormDialog/FieldFormDialog';

import './FormGenerator.css';
import { FormGenerator } from './index';
import { swapArray } from './utils';

export interface IAddQuestionOptionsProps {
  disabled: boolean
  options: any[]
  onSelect: (type: string) => void
}

const AddQuestionOptions = ({ disabled, options, onSelect }: IAddQuestionOptionsProps) => (
  <div className="add-question-options">
    <div className="add-question-option-container">
      {options.map((option: any, i: number) => (
        <div
          id={'type.' + option.type}
          key={option.type}
          className={cn('add-question-option', { 'disabled': disabled })}
          onClick={() => {
            if (!disabled) {
              onSelect(option.type);
            }
          }}
        >
          <Icon type={option.icon} style={{ fontSize: '1em', marginBottom: '0.2rem' }} />
          <span>{option.label}</span>
        </div>
      ))}
    </div>
  </div>
);

export interface IProps extends IBaseInputProps<FormGenerator, FormData> {
}

export interface IState {
  value: FormData
  componentBeingEdited: string
  fieldBeingEdited?: any
  fieldType?: string
  isAddingField: boolean
}

export class InputFormGenerator extends React.Component<IProps, IState> implements IBaseInput<FormData> {

  constructor(props: IProps) {
    super(props);

    this.state = {
      componentBeingEdited: '',
      fieldBeingEdited: undefined,
      fieldType: undefined,
      isAddingField: false,
      value: props.value || { fields: [], version: 0.1 },
    };
  }

  public componentWillReceiveProps(nProps: IProps) {
    if (nProps.value) {
      this.setState({ value: nProps.value });
    }
  }

  public onDeleteClick(components: any[], id: string) {
    const strings = this.props.field.strings || getStrings(this.props.field.language);

    Modal.confirm({
      cancelText: strings.no,
      content: strings.deleteConfirmationMessage,
      okText: strings.yes,
      okType: 'danger',
      onOk: () => {
        const updatedComponents = [...components];
        for (let i = 0; i < components.length; i += 1) {
          if (components[i].id === id) {
            updatedComponents.splice(i, 1);
            break;
          }
        }

        this.props.onChange({
          ...this.state.value,
          fields: updatedComponents,
        });
      },
      title: strings.deleteConfirmationTitle,
    });
  }

  public moveComponentUp(id: string) {
    const components = [...this.state.value.fields];

    for (let i = 0; i < components.length; i += 1) {
      if (components[i].id === id) {
        if (i === 0) {
          return;
        }

        swapArray(components, i, i - 1);
        break;
      }
    }

    this.props.onChange({
      ...this.state.value,
      fields: components,
    });
  }

  public moveComponentDown(id: string) {
    const components = [...this.state.value.fields];

    for (let i = 0; i < components.length; i += 1) {
      if (components[i].id === id) {
        if (i === components.length - 1) {
          return;
        }

        swapArray(components, i, i + 1);
        break;
      }
    }

    this.props.onChange({
      ...this.state.value,
      fields: components,
    });
  }

  public render() {
    const { errors, field: fieldData, value, onChange, disabled = false } = this.props;
    const { inline, language } = fieldData;
    const fields = (value && value.fields) ? value.fields : [];

    const hasError = errors && errors.length > 0;
    const error = hasError ? errors![0] : undefined;

    let order = 0;

    const strings = fieldData.strings || getStrings(language);

    return (
      <div
        className={cn('form-generator', { 'inline': inline })}
      >
        {(fields.length === 0 && !this.state.isAddingField) &&
        <div className="empty-message">
          {strings.noQuestionInForm}
        </div>
        }

        {(this.state.isAddingField || this.state.fieldBeingEdited) &&
        <FieldFormDialog
          field={this.state.fieldBeingEdited}
          fieldType={this.state.fieldType!}
          onSave={(newOrEditedField) => {

            if (this.state.isAddingField) {
              // adding new field
              onChange({
                ...this.state.value,
                fields: [...fields, newOrEditedField],
              });
              this.setState({ isAddingField: false });
            } else if (this.state.fieldBeingEdited) {
              // updating existing field
              const updatedComponents = [...fields];
              for (let i = 0; i < fields.length; i += 1) {
                if (fields[i].id === newOrEditedField.id) {
                  updatedComponents[i] = newOrEditedField;
                  break;
                }
              }
              onChange({
                ...this.state.value,
                fields: updatedComponents,
              });
              this.setState({ fieldBeingEdited: undefined });
            }
          }}
          onDismiss={() => this.setState({ fieldBeingEdited: undefined, isAddingField: false })}
          strings={strings}
        />
        }

        {fields.map((field: any) => {

          if (field.title && field.title !== '') {
            order += 1;
          }

          return (
            <FieldDisplay
              key={field.id}
              order={order}
              showControls={true}
              isPending={disabled || false}
              field={field}
              layout={'vertical'}
              onUpClick={(id: string) => this.moveComponentUp(id)}
              onDownClick={(id: string) => this.moveComponentDown(id)}
              onEditClick={() => this.setState({ fieldBeingEdited: field })}
              onDeleteClick={(id: string) => {
                this.onDeleteClick(fields, id);
              }}
            />
          );
        })}

        {(!this.state.isAddingField && !this.state.componentBeingEdited) &&
        <AddQuestionOptions
          options={[{
            icon: 'file-text',
            label: `+ ${strings.textField}`,
            type: TextInput.type,
          }, {
            icon: 'bars',
            label: `+ ${strings.singleChoice}`,
            type: SingleChoice.type,
          }, {
            icon: 'star-o',
            label: `+ ${strings.ratingStars}`,
            type: RatingStars.type,
          }]}
          onSelect={type => this.setState({ isAddingField: true, fieldType: type })}
          disabled={disabled}
        />
        }

        {error &&
        <div style={{ color: colors.error, marginTop: '1rem' }}>
          {error}
        </div>
        }
      </div>
    );
  }
}
