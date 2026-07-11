import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('renders active status', () => {
    render(<StatusChip label="Active" active />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders inactive status', () => {
    render(<StatusChip label="Inactive" active={false} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });
});
