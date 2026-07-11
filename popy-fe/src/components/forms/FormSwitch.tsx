import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { FormControlLabel, Switch } from '@mui/material';

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

export function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
}: FormSwitchProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
            />
          }
          label={label}
        />
      )}
    />
  );
}
