import { useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { Button } from '../components/Button';
import illustrationImg from '../assets/illustration.svg';
import logoImg from '../assets/logo.svg';
import '../styles/auth.scss';

import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

export function NewRoom() {
    const history = useHistory();
    const { user } = useAuth();
    const [newRoom, setNewRoom] = useState('');
    async function handleCreateRoom(e: FormEvent) {
        e.preventDefault();
        // check if input is empty
        if (newRoom.trim() === '') {
            return;
        }

        // Create the room in firestore
        const roomRef = database.ref('rooms'); //name of the schema
        const firebaseRoom = await roomRef.push({
            // insert into the schema
            title: newRoom,
            authorId: user?.id,
        });
        history.push(`/rooms/${firebaseRoom.key}`);
    }
    return (
        <div id="page-auth">
            <aside>
                <img
                    src={illustrationImg}
                    alt="Ilustração simbolizando perguntas e respostas"
                />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire as dúvidas da sua audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-content">
                    <img src={logoImg} alt="Letmeask" />
                    <h2>Criar uma nova sala</h2>
                    {/* submit fnc in the form not the btn, in the btn <enter> will activate it */}
                    <form onSubmit={handleCreateRoom}>
                        <input
                            type="text"
                            placeholder="Nome da sala"
                            // get the value from input
                            onChange={(event) => setNewRoom(event.target.value)}
                            value={newRoom}
                        />
                        <Button type="submit">Criar sala</Button>
                    </form>
                    <p>
                        Quer entrar em uma sala existente?
                        <Link to="/">clique aqui</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
