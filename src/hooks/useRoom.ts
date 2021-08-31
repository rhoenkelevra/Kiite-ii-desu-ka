import { useEffect, useState } from 'react';
import { database } from '../services/firebase';
import { useAuth } from './useAuth';

type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    isAnswered: string;
    isHighLighted: string;
    likeCount: number;
    likeId: string | undefined;
};

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
        // Record takes 2 ags
        likes: Record<
            string,
            {
                authorId: string;
            }
        >;
    }
>;

// This component will render the questions loading
export function useRoom(roomId: string) {
    // get user ID to manage hasLiked
    const { user } = useAuth();
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

                            likeCount: Object.values(value.likes ?? {}).length,

                            likeId: Object.entries(value.likes ?? {}).find(
                                ([key, like]) => like.authorId === user?.id,
                            )?.[0],
                        };
                    },
                );
                setTitle(databaseRoom.title);
                setQuestions(parsedQuestions);
            });
            // to unsubscribe from all event listeners
            // firebase off method
            return () => {
                roomRef.off('value');
            };
        },
        // roomId as dependecy so if the user navigates to another page, will refresh the list
        [roomId, user?.id],
        // user?.id is a variable that comes from outside the useEffect, so we pass as dependency of the useEffect. So if the userId changes, it will reload the questions
    );
    return { questions, title };
}
