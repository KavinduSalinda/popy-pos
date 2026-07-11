import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  fullWidth?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  fullWidth = true,
}: FormDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          value={field.value ? dayjs(field.value as string) : null}
          onChange={(value) =>
            field.onChange(value ? value.toISOString() : null)
          }
          slotProps={{
            textField: {
              size: 'small',
              fullWidth,
              error: Boolean(fieldState.error),
              helperText: fieldState.error?.message,
              onBlur: field.onBlur,
            },
          }}
        />
      )}
    />
  );
}
