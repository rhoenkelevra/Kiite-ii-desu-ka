import { BrowserRouter, Route } from 'react-router-dom';

import { Home } from './pages/Home';
import { NewRoom } from './pages/NewRoom';

import { AuthContextProvider } from './contexts/AuthContext';

function App() {
    return (
        <BrowserRouter>
            <AuthContextProvider>
                {/*Route component is like a page. the path with exact to match it or it will search for the anyone that starts with it*/}
                <Route path="/" exact component={Home} />
                <Route path="/rooms/new" component={NewRoom} />
            </AuthContextProvider>
        </BrowserRouter>
    );
}

export default App;
