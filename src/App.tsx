import React from 'react';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { Store } from './atomic-lib/store';
import { GlobalStyle, ThemeWrapper } from './styling';
import { StoreContext } from './atomic-react/hooks';
import Show from './routes/ShowRoute';
import New from './routes/NewRoute';
import { Navigation } from './components/Navigation';
import Settings from './routes/SettingsRoute';
import { Agent } from './atomic-lib/agent';
import { getSnowpackEnv, isDev } from './config';
import { handleWarning } from './helpers/handlers';
import { Edit } from './routes/EditRoute';
import HotKeysWrapper from './components/HotKeyWrapper';
import Data from './routes/DataRoute';
import { Shortcuts } from './routes/ShortcutsRoute';
import { Welcome } from './routes/WelcomeRoute';
import Local from './routes/LocalRoute';
import { AppSettingsContextProvider } from './helpers/AppSettings';

/** Initialize the store */
const store = new Store();
/** Defaulting to the current URL's origin will make sense in most non-dev environments */
store.setBaseUrl(window.location.origin);

/** Entrypoint of the application. This is where providers go. */
function App(): JSX.Element {
  return (
    <StoreContext.Provider value={store}>
      <AppSettingsContextProvider>
        {/* Basename is for hosting on GitHub pages */}
        <BrowserRouter basename='/'>
          {/* Used for getting / setting query parameters */}
          <QueryParamProvider ReactRouterRoute={Route}>
            <HotKeysWrapper>
              <ThemeWrapper>
                <GlobalStyle />
                <Navigation>
                  <Switch>
                    <Route path='/new'>
                      <New />
                    </Route>
                    <Route path='/edit'>
                      <Edit />
                    </Route>
                    <Route path='/data'>
                      <Data />
                    </Route>
                    <Route path='/settings'>
                      <Settings />
                    </Route>
                    <Route path='/shortcuts'>
                      <Shortcuts />
                    </Route>
                    <Route path='/show'>
                      <Show />
                    </Route>
                    <Route path='/:path'>
                      <Local />
                    </Route>
                    <Route path='/'>
                      <Welcome />
                    </Route>
                  </Switch>
                </Navigation>
              </ThemeWrapper>
            </HotKeysWrapper>
          </QueryParamProvider>
        </BrowserRouter>
      </AppSettingsContextProvider>
    </StoreContext.Provider>
  );
}

export default App;

declare global {
  interface Window {
    store: Store;
  }
}

if (isDev()) {
  const agentSubject = getSnowpackEnv('AGENT');
  const agentPrivateKey = getSnowpackEnv('PRIVATE_KEY');
  if (agentSubject && agentPrivateKey) {
    handleWarning(`Setting agent ${agentSubject} with privateKey from .env`);
    const agent = new Agent(getSnowpackEnv('AGENT'), getSnowpackEnv('PRIVATE_KEY'));
    store.setAgent(agent);
  } else {
    handleWarning(`No AGENT and PRIVATE_KEY found in .env, Agent not set.`);
  }

  const baseUrl = getSnowpackEnv('BASE_URL');
  if (baseUrl !== undefined) {
    store.setBaseUrl(baseUrl);
    handleWarning(`Set baseURL ${baseUrl} from .env`);
  } else {
    handleWarning(`No BASE_URL found in .env, defaulting to https://atomicdata.dev.`);
  }

  // You can access the Store from your console in dev mode!
  window.store = store;
}
