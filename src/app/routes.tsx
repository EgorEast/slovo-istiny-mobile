import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from 'pages/home';
import { RootStackParamList } from 'shared';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const Routing = () => (
  <NavigationContainer>
    <RootStack.Navigator initialRouteName='Home'>
      <RootStack.Screen
        name='Home'
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* <RootStack.Screen name='Task' component={TaskScreen} />
      <RootStack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
        }}
      >
        <RootStack.Screen name='AddTask' component={AddTaskScreen} />
      </RootStack.Group> */}
    </RootStack.Navigator>
  </NavigationContainer>
);
