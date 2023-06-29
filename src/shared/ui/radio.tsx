import { FC, PropsWithChildren } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

type RadioButtonGroupProps = PropsWithChildren<{}>;

type RadioButtonProps = {
  selected: boolean;
  label: string;
  disabled?: boolean;
  onValueChange?: (selected: boolean) => void;
};

export const RadioButtonGroup: FC<RadioButtonGroupProps> = ({ children }) => (
  <View>{children}</View>
);

export const RadioButton = (props: RadioButtonProps) => {
  const { selected, label, disabled, onValueChange } = props;

  const handleOnPress = () => {
    !disabled && onValueChange && onValueChange(!selected);
  };

  return (
    <TouchableOpacity onPress={handleOnPress} disabled={disabled}>
      <View>
        {label ? <Text>{label}</Text> : null}
        <View>{selected ? <View /> : null}</View>
      </View>
    </TouchableOpacity>
  );
};
