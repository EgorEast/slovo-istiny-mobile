import { useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { Task, NavProp } from 'shared';

type TaskRowProps = {
  data: Task;
  before?: ReactNode;
};

export const TaskRow = ({ data, before }: TaskRowProps) => {
  const { id, title, completed } = data;
  const { navigate } = useNavigation<NavProp<'Tasks'>>();

  const onTaskPress = () => navigate('Task', { id });

  return (
    <TouchableOpacity onPress={onTaskPress}>
      <View>
        {before}
        <Text numberOfLines={2}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
