import { ButtonHTMLAttributes } from 'react';
import '../styles/button.scss';

// get all types relatives to the button attributes.
// comes direct from react itself
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
    return <button className="button" {...props} />;
}
