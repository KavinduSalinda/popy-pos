import { BrowserRouter, HashRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRoutes } from '@/app/routes/AppRoutes';
import { isElectron } from '@/services/serverConfig';

const Router = isElectron() ? HashRouter : BrowserRouter;

export const App = () => (
  <AppProviders>
    <Router>
      <AppRoutes />
    </Router>
  </AppProviders>
);

export default App;
