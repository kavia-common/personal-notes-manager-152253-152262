import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders Notes App header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Notes App/i);
  expect(headerElement).toBeInTheDocument();
});

test('can add and save a new note', () => {
  render(<App />);
  const newBtn = screen.getByText(/\+ New Note/i);
  fireEvent.click(newBtn);
  const titleInput = screen.getByPlaceholderText("Title");
  fireEvent.change(titleInput, { target: { value: "Test Title" } });
  const bodyInput = screen.getByPlaceholderText(/Write your note/i);
  fireEvent.change(bodyInput, { target: { value: "Test Body" } });
  fireEvent.click(screen.getByText(/Save/i));
  expect(titleInput.value).toBe("Test Title");
  expect(bodyInput.value).toBe("Test Body");
});

test('can search notes by title', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/\+ New Note/i));
  const titleInput = screen.getByPlaceholderText("Title");
  fireEvent.change(titleInput, { target: { value: "Unique Title" } });
  fireEvent.click(screen.getByText(/Save/i));
  fireEvent.change(screen.getByPlaceholderText(/Search notes/i), { target: { value: "Unique" } });
  expect(screen.getByDisplayValue("Unique Title")).toBeInTheDocument();
});
