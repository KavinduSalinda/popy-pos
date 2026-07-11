import { useEffect, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Close from '@mui/icons-material/Close';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  onSearch: (value: string) => void;
  fullWidth?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const SearchInput = ({
  value = '',
  placeholder = 'Search…',
  debounceMs = 400,
  onSearch,
  fullWidth = false,
  onFocus,
  onBlur,
}: SearchInputProps) => {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, debounceMs);

  useEffect(() => {
    onSearch(debounced.trim());
    // onSearch identity is owned by the caller; we only react to debounced text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <TextField
      size="small"
      value={text}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      fullWidth={fullWidth}
      sx={{ minWidth: fullWidth ? undefined : 260 }}
      slotProps={{
        input: {
          'aria-label': 'search',
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: text ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="clear search"
                onClick={() => setText('')}
              >
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
};
