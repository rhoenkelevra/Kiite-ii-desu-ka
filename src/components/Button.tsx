import { useState } from 'react';

export function Button() {
    // let counter = 0; // in React to change state we can't do like in normal JS
    const [counter, setCounter] = useState(0);

    function increment() {
        setCounter(counter + 1);
        console.log(counter);
        // this log will display a value always 1 behind than the UI because of closures
        // it's value is 1 scope behind than setCounter
    }

    return <button onClick={increment}>{counter}</button>;
}
