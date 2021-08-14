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
    children: ReactNode; //children pros get this type
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User>();

    // ======= Retrieve User Info ==========
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
        <AuthContext.Provider value={{ user, signInWithGoogle }}>
            {props.children}
            {/* the childres are the components inside of the context, so we pass them here */}
        </AuthContext.Provider>
    );
}
