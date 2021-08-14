import { createContext, ReactNode, useState, useEffect } from 'react';
import { auth, firebase } from '../services/firebase';

type User = {
    id: string;
    name: string;
    avatar: string;
};

type AuthContextType = {
    user: User | undefined; // useState has User | Undefined
    signInWithGoogle: () => Promise<void>; // the func is async so returns a promise
};

type AuthContextProviderProps = {
    children: ReactNode; //children get this type
};

// create the context,pass the context format (ie. string, '')
// export const TestContext = createContext({} as any);
// the receiver can't figure out it's type, so for now avoid this put as any
export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
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
        const unsubscribe = auth.onAuthStateChanged((user) => {
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
        // good practice to when subscribing to an event listenerb with useEffect like the onAuthStateChanged
        // to at the to turn it off, so it won't keep fireing even when the component has changed
        // to do it, we put the above func in a variable, (const unsubscribe)
        // then return it
        return () => {
            unsubscribe();
        };
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
        //  pass the state to the provider as obj
        //  <TestContext.Provider value={{ value, setValue }}>
        //  in this case we pass the signIn so other pages can use this feature
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
        </AuthContext.Provider>
    );
}
