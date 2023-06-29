import { Text } from 'react-native';
import type { Task } from 'shared';

type Props = {
  task?: Task;
};

export const TaskCard = ({ task }: Props) => {
  if (!task) return null;

  const { id, title } = task;

  return (
    <>
      <Text>Task#{id}</Text>
      <Text>{title}</Text>
    </>
  );
};
