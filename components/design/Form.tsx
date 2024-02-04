import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import { useState } from 'react';
import {
  FieldValues,
  FormContainer,
  FormContainerProps,
  TextFieldElement,
  TextFieldElementProps,
  UseFormProps,
} from 'react-hook-form-mui';

type FormField = {
  fieldType: 'text';
} & TextFieldElementProps;

interface FormProps {
  formFields: FormField[];
  defaultValues?: UseFormProps['defaultValues'];
  onSuccess: FormContainerProps['onSuccess'];
  errorMessage?: string;
}

export default function Form({ formFields, defaultValues, onSuccess, errorMessage }: FormProps) {
  const [isFormProcessing, setIsFormProcessing] = useState(false);

  function handleSuccess(data: FieldValues) {
    setIsFormProcessing(true);
    if (onSuccess) {
      onSuccess(data);
    }
    setIsFormProcessing(false);
  }
  return (
    <FormContainer defaultValues={defaultValues} onSuccess={handleSuccess}>
      {formFields.map(({ fieldType, ...fieldProps }) => {
        if (fieldType === 'text') {
          return <TextFieldElement key={fieldProps.name} {...fieldProps} className="mb-4" />;
        }
      })}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <LoadingButton
        variant="contained"
        type="submit"
        loading={isFormProcessing}
        startIcon={<SaveIcon />}
      >
        Save
      </LoadingButton>
    </FormContainer>
  );
}

export type { FormField };
