import { Entypo } from '@expo/vector-icons';
import { Text, View } from 'react-native';
// import { taskModel } from '../model';

type Props = {
  taskId: number;
};

export const TaskFooter = ({ taskId }: Props) => {
  const task = taskModel.selectors.useTask(taskId);

  return (
    <View>
      <Text>Task is owned by:</Text>
      <View>
        <Entypo name='user' size={24} color='black' />
        <Text>{task.userId}</Text>
      </View>
    </View>
  );
};
