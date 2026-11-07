import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button, Screen } from '../components/ui';

export default function NotFound() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-6">
        <Text accessibilityRole="header" className="text-center text-3xl font-bold text-foreground">Página não encontrada</Text>
        <Text className="text-center text-base text-muted-foreground">Confira o link divulgado pela igreja ou busque pelo identificador.</Text>
        <Button title="Encontrar uma igreja" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
