import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { TextField, type TextFieldProps } from '@mui/material';

type FormTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
} & Omit<TextFieldProps, 'name' | 'error' | 'value' | 'defaultValue'>;

export function FormTextField<T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  ...rest
}: FormTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...rest}
          type={type}
          label={label}
          value={field.value ?? ''}
          onChange={(e) => {
            const raw = e.target.value;
            field.onChange(
              type === 'number' ? (raw === '' ? '' : Number(raw)) : raw,
            );
          }}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? rest.helperText}
          fullWidth={rest.fullWidth ?? true}
          size={rest.size ?? 'small'}
        />
      )}
    />
  );
}
