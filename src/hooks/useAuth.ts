import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
    const value = useContext(AuthContext);

    return value;
}

/**
 * Every time that we want to use the Authcontext, we have to make 2 imports
 * the useContext and the AutContext
 *
 * to make it simpler, we create this hook that transforms 2 in one
 */
