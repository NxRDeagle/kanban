import AppLoader from "./components/app-loader/AppLoader";
import AppRouter from "./components/app-router/AppRouter";
import AppLayout from "./components/layout/app-layout/AppLayout";
import useAuthBootstrap from "./hooks/useAuthBootstrap";

export default function App() {
  const ready = useAuthBootstrap();

  if (!ready) {
    return (
      <AppLayout>
        <AppLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AppRouter />
    </AppLayout>
  );
}
