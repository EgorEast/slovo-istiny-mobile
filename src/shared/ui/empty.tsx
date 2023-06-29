import { Text, View } from 'react-native';

type Props = {
  desc: string;
};

export const Empty = ({ desc }: Props) => {
  return (
    <View>
      <Text>{desc}</Text>
    </View>
  );
};
