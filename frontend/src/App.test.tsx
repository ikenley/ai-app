import { render } from "@testing-library/react";
import "axios";
import App from "./App";

test("renders learn react link", () => {
  const { queryByText } = render(<App />);

  expect(queryByText(/learn react/i)).not.toBeInTheDocument();
});
