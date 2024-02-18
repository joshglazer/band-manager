import { SongsComposite } from '@/hooks/useSongs';
import { useMemo } from 'react';
import ModalWithTrigger from '../design/ModalWithTrigger';
import SongCommentForm from '../forms/SongCommentForm';

interface SongCommentsModalProps {
  commentsCount: number;
  song: SongsComposite;
}

export default function SongCommentsModal({ commentsCount, song }: SongCommentsModalProps) {
  const buttonText = useMemo(() => {
    return <>{commentsCount}</>;
  }, [commentsCount]);

  const modalTitle = useMemo(() => {
    return `${song.name} Comments`;
  }, [song.name]);

  const modalContent = useMemo(() => {
    return <SongCommentForm songId={song.id} />;
  }, [song.id]);

  return (
    <ModalWithTrigger buttonText={buttonText} modalTitle={modalTitle} modalContent={modalContent} />
  );
}
