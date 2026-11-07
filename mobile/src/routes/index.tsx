import { useState } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { Button, Card, ErrorNotice, Screen } from '../components/ui';
import { parseChurchInput } from '../lib/links';

export default function Welcome() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function openChurch() {
    const identifier = parseChurchInput(value, process.env.EXPO_PUBLIC_WEB_URL);
    if (!identifier) {
      setError('Informe o slug, o UUID da igreja ou um link oficial de QR Code válido.');
      return;
    }
    setError('');
    router.push({ pathname: '/igreja/[identifier]', params: { identifier } });
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-8">
        <View className="gap-3">
          <Text className="text-sm font-bold uppercase tracking-widest text-primary">RAFAH</Text>
          <Text accessibilityRole="header" className="text-4xl font-bold text-foreground">Sua igreja, mais perto.</Text>
          <Text className="text-base leading-7 text-muted-foreground">Encontre cultos, localização e agenda. As informações públicas estão disponíveis sem cadastro.</Text>
        </View>
        <Card>
          <Text nativeID="church-label" className="text-base font-semibold text-foreground">Qual igreja você deseja visitar?</Text>
          <TextInput
            accessibilityLabel="Slug, UUID ou link oficial da igreja"
            accessibilityLabelledBy="church-label"
            value={value}
            onChangeText={(text) => { setValue(text); setError(''); }}
            placeholder="Slug, UUID ou link do QR Code"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={2048}
            returnKeyType="go"
            onSubmitEditing={openChurch}
            className="min-h-14 rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground"
          />
          <Button title="Conhecer a igreja" onPress={openChurch} disabled={!value.trim()} />
          <Text className="text-sm leading-6 text-muted-foreground">Use a câmera do seu celular para abrir o QR Code divulgado pela igreja ou cole o link acima. Não é necessário permitir acesso à câmera neste aplicativo.</Text>
        </Card>
        {error ? <ErrorNotice message={error} /> : null}
      </View>
    </Screen>
  );
}
