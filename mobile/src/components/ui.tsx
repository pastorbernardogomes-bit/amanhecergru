import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="mx-auto w-full max-w-3xl flex-1 gap-6 px-5 py-8">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Button({ title, onPress, secondary = false, disabled = false }: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-xl border px-5 py-3 ${secondary ? 'border-border bg-card' : 'border-primary bg-primary'} ${disabled ? 'opacity-50' : 'active:opacity-75'}`}
    >
      <Text className={`text-center text-base font-semibold ${secondary ? 'text-primary' : 'text-primary-foreground'}`}>{title}</Text>
    </Pressable>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View className="gap-3 rounded-2xl border border-border bg-card p-5">{children}</View>;
}

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center gap-4 py-16" accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color="#164e63" accessibilityLabel="Carregando" />
      <Text className="text-base text-muted-foreground">Carregando informações públicas…</Text>
    </View>
  );
}

export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <Card>
      <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" className="text-base text-destructive">{message}</Text>
      {retry && <Button title="Tentar novamente" onPress={retry} secondary />}
    </Card>
  );
}
