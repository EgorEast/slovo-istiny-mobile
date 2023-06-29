import { Text, View } from 'react-native';

type Props = {
  desc: string;
};

export const Empty = ({ desc }: Props) => (
  <View>
    <Text>{desc}</Text>
  </View>
);
