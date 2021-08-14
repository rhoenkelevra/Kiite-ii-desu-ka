import { BrowserRouter, Route } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';

import { Home } from './pages/Home';
import { NewRoom } from './pages/NewRoom';

import { firebase, auth } from './services/firebase';

type User = {
    id: string;
    name: string;
    avatar: string;
};

type AuthContextType = {
    user: User | undefined; // useState has User | Undefined
    signInWithGoogle: () => Promise<void>; // the func is async so returns a promise
};

// create the context,pass the context format (ie. string, '')
// export const TestContext = createContext({} as any);
// the receiver can't figure out it's type, so for now avoid this put as any
export const AuthContext = createContext({} as AuthContextType);

function App() {
    // useState to create the value and the func to pass it to context
    // so all components that have access to it, can receive the value
    // and also change the value using that func
    // const [value, setValue] = useState('Teste');
    const [user, setUser] = useState<User>();

    // ======= Retrieve User Info ==========
    // useEffect a hook that is a function that fires when something happend (component life cycle)
    // first param is the function, the second is the event, as a vector [])
    // [] fires when page is loaded
    // [user] fires when the user value has change
    useEffect(() => {
        // check with firebase if user had auth before
        auth.onAuthStateChanged((user) => {
            // check the user data and get it
            if (user) {
                const { displayName, photoURL, uid } = user;

                if (!displayName || !photoURL) {
                    throw new Error('Missing info from google account');
                }

                setUser({
                    id: uid,
                    name: displayName,
                    avatar: photoURL,
                });
            }
        });
    }, []);

    async function signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        const res = await auth.signInWithPopup(provider);
        if (res.user) {
            const { displayName, photoURL, uid } = res.user;

            if (!displayName || !photoURL) {
                throw new Error('Missing info from google account');
            }

            setUser({
                id: uid,
                name: displayName,
                avatar: photoURL,
            });
        }
    }
    return (
        <BrowserRouter>
            {/* pass the state to the provider as obj */}
            {/* <TestContext.Provider value={{ value, setValue }}> */}
            {/* in this case we pass the signIn so other pages can use this feature */}
            <AuthContext.Provider value={{ user, signInWithGoogle }}>
                {/*Route component is like a page. the path with exact to match it or it will search for the anyone that starts with it*/}
                <Route path="/" exact component={Home} />
                <Route path="/rooms/new" component={NewRoom} />
            </AuthContext.Provider>
        </BrowserRouter>
    );
}

export default App;
