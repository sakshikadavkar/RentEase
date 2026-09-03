import { BrowserRouter } from 'react-router-dom';
import { RentalProvider } from './context/RentalProvider';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <RentalProvider>
        <AppRouter />
      </RentalProvider>
    </BrowserRouter>
  );
}
