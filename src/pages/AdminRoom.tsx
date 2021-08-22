import { FormEvent, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { database } from '../services/firebase';

import logoImg from '../assets/logo.svg';
import '../styles/room.scss';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';

type RoomParams = {
    id: string;
};

// type for db result as obj
export function AdminRoom() {
    // get the room id from url
    const params = useParams<RoomParams>();
    // params.id complains, because it doesn't know what param to expect
    // so create a type for it and insert as generic
    const roomId = params.id;

    const [newQuestion, setNewQuestion] = useState('');
    const { user } = useAuth();
    const { questions, title } = useRoom(roomId);

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
                    <div>
                        <RoomCode code={roomId} />
                        <Button isOutlined>Encerrar salar</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && (
                        <span>{questions.length} perguntas</span>
                    )}
                </div>

                <div className="question-list">
                    {questions.map((question) => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
