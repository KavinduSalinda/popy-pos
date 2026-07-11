import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import type { SelectOption } from '@/types';

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: SelectOption<string | number>[];
  fullWidth?: boolean;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  fullWidth = true,
  disabled = false,
}: FormSelectProps<T>) {
  const labelId = `${name}-label`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl
          fullWidth={fullWidth}
          size="small"
          error={Boolean(fieldState.error)}
          disabled={disabled}
        >
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            labelId={labelId}
            label={label}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          >
            {options.map((option) => (
              <MenuItem key={String(option.value)} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {fieldState.error?.message && (
            <FormHelperText>{fieldState.error.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
}
