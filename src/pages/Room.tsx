import { FormEvent, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { database } from 'services/firebase';

import logoImg from 'assets/logo.svg';
import '../styles/room.scss';

import { useAuth } from 'hooks/useAuth';
import { useRoom } from 'hooks/useRoom';

import { Button } from 'components/Button';
import { RoomCode } from 'components/RoomCode';
import { Question } from 'components/Question';

type RoomParams = {
    id: string;
};

export function Room() {
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
        toast.success('Question sent with success!');
        setNewQuestion('');
    }

    async function handleLikeQuestion(
        questionId: string,
        likeId: string | undefined,
    ) {
        if (likeId) {
            // remove like
            await database
                .ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`)
                .remove();
        } else {
            await database
                .ref(`rooms/${roomId}/questions/${questionId}/likes`)
                .push({
                    authorId: user?.id,
                });
        }
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
                    <h1>Room {title}</h1>
                    {/* shorthand for ternary conditional */}
                    {questions.length > 0 && (
                        <span>{questions.length} questions</span>
                    )}
                </div>
                <form onSubmit={handleSendQuestion}>
                    <textarea
                        placeholder="What do you want to ask?"
                        // set state as the input
                        onChange={(e) => setNewQuestion(e.target.value)}
                        // set the value as the state, so both will be synced
                        value={newQuestion}
                    />
                    <div className="form-footer">
                        {user ? (
                            // if there is user, get info
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <span>{user.name}</span>
                            </div>
                        ) : (
                            <span>
                                To send a question,
                                <button>login</button>.
                            </span>
                        )}

                        <Button type="submit" disabled={!user}>
                            Send Question
                        </Button>
                    </div>
                </form>
                <div className="question-list">
                    {questions.map((question) => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}>
                                {/* like btn */}
                                <button
                                    className={`like-button ${
                                        question.likeId ? 'liked' : ''
                                    }`}
                                    type="button"
                                    aria-label="marcar como gostei"
                                    // onClick accepts a fn, not fn call
                                    onClick={() =>
                                        handleLikeQuestion(
                                            question.id,
                                            question.likeId,
                                        )
                                    }>
                                    {question.likeCount > 0 && (
                                        <span>{question.likeCount}</span>
                                    )}
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
                                            stroke="#737380"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </Question>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
