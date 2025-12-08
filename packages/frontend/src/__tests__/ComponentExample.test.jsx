import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Box, Button, Text } from '@chakra-ui/react';

// Simple Counter Component for testing
const Counter = ({ initialCount = 0, onCountChange }) => {
  const [count, setCount] = React.useState(initialCount);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  const handleDecrement = () => {
    const newCount = count - 1;
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <Box>
      <Text data-testid="count-display">Count: {count}</Text>
      <Button onClick={handleIncrement} data-testid="increment-btn">
        Increment
      </Button>
      <Button onClick={handleDecrement} data-testid="decrement-btn">
        Decrement
      </Button>
    </Box>
  );
};

describe('Counter Component Example', () => {
  it('should render with initial count', () => {
    render(<Counter initialCount={5} />);

    const countDisplay = screen.getByTestId('count-display');
    expect(countDisplay).toHaveTextContent('Count: 5');
  });

  it('should increment count when button clicked', () => {
    render(<Counter initialCount={0} />);

    const incrementBtn = screen.getByTestId('increment-btn');
    const countDisplay = screen.getByTestId('count-display');

    fireEvent.click(incrementBtn);
    expect(countDisplay).toHaveTextContent('Count: 1');

    fireEvent.click(incrementBtn);
    expect(countDisplay).toHaveTextContent('Count: 2');
  });

  it('should decrement count when button clicked', () => {
    render(<Counter initialCount={5} />);

    const decrementBtn = screen.getByTestId('decrement-btn');
    const countDisplay = screen.getByTestId('count-display');

    fireEvent.click(decrementBtn);
    expect(countDisplay).toHaveTextContent('Count: 4');
  });

  it('should call onCountChange callback', () => {
    const handleCountChange = vi.fn();
    render(<Counter initialCount={0} onCountChange={handleCountChange} />);

    const incrementBtn = screen.getByTestId('increment-btn');

    fireEvent.click(incrementBtn);

    expect(handleCountChange).toHaveBeenCalledTimes(1);
    expect(handleCountChange).toHaveBeenCalledWith(1);
  });
});
