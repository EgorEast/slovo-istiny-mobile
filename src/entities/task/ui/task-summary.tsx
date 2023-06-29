import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { taskModel } from '../model';

type Props = {
  actionItem?: ReactNode;
};

export const TasksSummary = ({ actionItem }: Props) => {
  const numberOfTasks = taskModel.selectors.getFilteredTasks().length;

  return (
    <View>
      <Text>Number of tasks: {numberOfTasks}</Text>
      {actionItem}
    </View>
  );
};
