import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/App';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { registerAllGameEditors } from '@/ui/pages/admin/registerEditors';

// Register game editors early
registerAllGameEditors();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
