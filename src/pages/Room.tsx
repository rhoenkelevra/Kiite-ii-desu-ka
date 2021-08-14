import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { database } from '../services/firebase';

import logoImg from '../assets/logo.svg';
import '../styles/room.scss';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';

type RoomParams = {
    id: string;
};

// type for db result as obj
type FirebaseQuestions = Record<
    string,
    {
        author: {
            name: string;
            avatar: string;
        };
        content: string;
        isAnswered: string;
        isHighLighted: string;
    }
>;
type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: string;
    isHighLighted: string;
};

export function Room() {
    // get the room id from url
    const params = useParams<RoomParams>();
    // params.id complains, because it doesn't know what param to expect
    // so create a type for it and insert as generic
    const roomId = params.id;

    // set the question list as state
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('');

    useEffect(
        () => {
            // get existing questions from db
            const roomRef = database.ref(`rooms/${roomId}`);
            // change to .on to listen to every change !but is very costly. Not good for prod
            roomRef.on('value', (room) => {
                const databaseRoom = room.val();
                const firebaseQuestions: FirebaseQuestions =
                    databaseRoom.questions ?? {};
                // transform the res obj to array (matrix)
                const parsedQuestions = Object.entries(firebaseQuestions).map(
                    // values will return as array but in key,value format
                    ([key, value]) => {
                        return {
                            id: key,
                            content: value.content,
                            author: value.author,
                            isHighLighted: value.isHighLighted,
                            isAnswered: value.isAnswered,
                        };
                    },
                );
                setTitle(databaseRoom.title);
                setQuestions(parsedQuestions);
            });
        },
        // roomId as dependecy so if the user navigates to another page, will refresh the list
        [roomId],
    );

    const [newQuestion, setNewQuestion] = useState('');
    const { user } = useAuth();
    async function handleSendQuestion(e: FormEvent) {
        e.preventDefault();
        if (newQuestion.trim() === '') {
            toast.error('Question form was empty');
            return;
        }
        if (!user) {
            toast.error('You must be logged in');
        }
        const question = {
            content: newQuestion,
            author: {
                name: user?.name,
                avatar: user?.avatar,
            },
            isHighLighted: false,
            isAnswered: false,
        };

        await database.ref(`rooms/${roomId}/questions`).push(question);
        toast.success('Question send with success!');
        setNewQuestion('');
    }
    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <RoomCode code={roomId} />
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && (
                        <span>{questions.length} perguntas</span>
                    )}
                </div>
                <form onSubmit={handleSendQuestion}>
                    <textarea
                        placeholder="O que você quer perguntar?"
                        onChange={(e) => setNewQuestion(e.target.value)}
                        value={newQuestion}
                    />
                    <div className="form-footer">
                        {user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>
                                Para enviar uma pergunta,
                                <button>faça seu login</button>.
                            </span>
                        )}

                        <Button type="submit" disabled={!user}>
                            Enviar Pergunta
                        </Button>
                    </div>
                </form>

                {JSON.stringify(questions)}
            </main>
        </div>
    );
}
