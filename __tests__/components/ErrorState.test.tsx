import { fireEvent, render, screen } from "@testing-library/react-native";
import * as eva from "@eva-design/eva";
import { ApplicationProvider } from "@ui-kitten/components";
import { ErrorState } from "../../components/ui/ErrorState";

function renderWithKitten(ui: React.ReactElement) {
  return render(
    <ApplicationProvider {...eva} theme={eva.light}>
      {ui}
    </ApplicationProvider>,
  );
}

test("renders the default error title and subtitle when no props given", () => {
  renderWithKitten(<ErrorState />);
  expect(screen.getByText("تعذّر تحميل البيانات")).toBeTruthy();
  expect(screen.getByText("تحقق من اتصالك بالإنترنت وحاول مجدداً")).toBeTruthy();
});

test("renders a custom title and subtitle", () => {
  renderWithKitten(<ErrorState title="خطأ" subtitle="حاول لاحقاً" />);
  expect(screen.getByText("خطأ")).toBeTruthy();
  expect(screen.getByText("حاول لاحقاً")).toBeTruthy();
});

test("invokes onRetry when retry button is pressed", () => {
  const onRetry = jest.fn();
  renderWithKitten(<ErrorState onRetry={onRetry} />);

  fireEvent.press(screen.getByText("إعادة المحاولة"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test("hides the retry button when onRetry is not supplied", () => {
  renderWithKitten(<ErrorState />);
  expect(screen.queryByText("إعادة المحاولة")).toBeNull();
});
