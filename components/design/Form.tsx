'use client';

import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import { useMemo, useState } from 'react';
import {
  FieldValues,
  FormContainer,
  FormContainerProps,
  PasswordElement,
  TextFieldElement,
  TextFieldElementProps,
  UseFormProps,
  SelectElement,
  SelectElementProps,
} from 'react-hook-form-mui';

type FormField =
  | ({
      fieldType: 'text' | 'textarea' | 'password' | 'select';
    } & TextFieldElementProps)
  | ({
      fieldType: 'select';
    } & SelectElementProps);

interface FormProps {
  formFields: FormField[];
  defaultValues?: UseFormProps['defaultValues'];
  onSuccess?: FormContainerProps['onSuccess'];
  errorMessage?: string;
  saveButtonLabel?: string;
  saveButtonDisplay?: boolean;
  saveButtonIcon?: JSX.Element;
}

export default function Form({
  formFields,
  defaultValues,
  onSuccess,
  errorMessage,
  saveButtonLabel = 'Save',
  saveButtonDisplay = true,
  saveButtonIcon = <SaveIcon />,
}: Readonly<FormProps>) {
  const [isFormProcessing, setIsFormProcessing] = useState(false);

  function handleSuccess(data: FieldValues) {
    setIsFormProcessing(true);
    if (onSuccess) {
      onSuccess(data);
    }
    setIsFormProcessing(false);
  }

  const sharedFieldProps: Partial<TextFieldElementProps & SelectElementProps> = useMemo(
    () => ({ className: 'mb-4' }),
    []
  );

  return (
    <FormContainer defaultValues={defaultValues} onSuccess={handleSuccess}>
      {formFields.map(({ fieldType, ...fieldProps }) => {
        let field: JSX.Element;
        switch (fieldType) {
          case 'text':
          case 'textarea': {
            const extraProps: Partial<TextFieldElementProps> = {};
            if (fieldType === 'textarea') {
              extraProps.multiline = true;
            }
            field = (
              <TextFieldElement
                key={fieldProps.name}
                {...(fieldProps as TextFieldElementProps)}
                {...extraProps}
                {...sharedFieldProps}
              />
            );
            break;
          }
          case 'password': {
            field = (
              <PasswordElement
                key={fieldProps.name}
                {...(fieldProps as TextFieldElementProps)}
                {...sharedFieldProps}
              />
            );
            break;
          }
          case 'select': {
            console.log((fieldProps as SelectElementProps).options);
            const { key, ...props } = fieldProps as SelectElementProps;
            field = <SelectElement {...props} {...sharedFieldProps} key={fieldProps.name} />;
            break;
          }
          default: {
            return (
              <Alert severity="error">Error: Field Type of {fieldType} is not supported</Alert>
            );
          }
        }

        return field;
      })}
      {errorMessage && (
        <Alert severity="error" className="mb-4">
          {errorMessage}
        </Alert>
      )}
      <LoadingButton
        variant="contained"
        type="submit"
        loading={isFormProcessing}
        startIcon={saveButtonDisplay && saveButtonIcon}
      >
        {saveButtonLabel}
      </LoadingButton>
    </FormContainer>
  );
}

export type { FormField };
