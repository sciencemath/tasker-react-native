import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { theme } from '../theme';

const Layout = () => {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.colorCerulean }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shopping list',
          tabBarIcon: (args) => <Feather name="list" {...args} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: 'Counter',
          headerShown: false,
          tabBarIcon: (args) => <AntDesign name="clockcircleo" {...args} />,
        }}
      />
      <Tabs.Screen
        name="idea"
        options={{
          title: 'Idea',
          tabBarIcon: (args) => <FontAwesome5 name="lightbulb" {...args} />,
        }}
      />
    </Tabs>
  );
};

export default Layout;
