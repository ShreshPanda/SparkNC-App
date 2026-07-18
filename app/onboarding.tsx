import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const SUPPORT_STYLES = ['gentle', 'direct', 'structured', 'casual'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState('');
  const [interests, setInterests] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [supportStyle, setSupportStyle] = useState('gentle');

  const submit = async () => {
    const payload = {
      goals: goals.split(',').map((s) => s.trim()).filter(Boolean),
      interests: interests.split(',').map((s) => s.trim()).filter(Boolean),
      growthAreas: growthAreas.split(',').map((s) => s.trim()).filter(Boolean),
      supportStyle,
      completed: true,
    };
    // TODO: wire to cloudflareService onboarding endpoint
    console.log('Submit onboarding', payload);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="space-y-4">
            <Text className="text-xl font-bold">What are your goals?</Text>
            <TextInput className="border border-gray-300 rounded p-3" multiline value={goals} onChangeText={setGoals} placeholder="Learn programming, get organized..." />
          </View>
        );
      case 1:
        return (
          <View className="space-y-4">
            <Text className="text-xl font-bold">What are you interested in?</Text>
            <TextInput className="border border-gray-300 rounded p-3" multiline value={interests} onChangeText={setInterests} placeholder="Design, science, entrepreneurship..." />
          </View>
        );
      case 2:
        return (
          <View className="space-y-4">
            <Text className="text-xl font-bold">Where do you want to grow?</Text>
            <TextInput className="border border-gray-300 rounded p-3" multiline value={growthAreas} onChangeText={setGrowthAreas} placeholder="Communication, time management..." />
          </View>
        );
      case 3:
        return (
          <View className="space-y-4">
            <Text className="text-xl font-bold">How do you like support?</Text>
            {SUPPORT_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                className={`p-3 rounded border ${supportStyle === style ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}
                onPress={() => setSupportStyle(style)}
              >
                <Text className={supportStyle === style ? 'text-white' : ''}>{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-6">Welcome to SparkNC</Text>
      {renderStep()}
      <View className="mt-8 flex-row justify-between">
        {step > 0 && (
          <TouchableOpacity className="px-4 py-3 rounded bg-gray-200" onPress={() => setStep(step - 1)}>
            <Text>Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity className="px-4 py-3 rounded bg-blue-500" onPress={() => setStep(step + 1)}>
            <Text className="text-white">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="px-4 py-3 rounded bg-green-500" onPress={submit}>
            <Text className="text-white">Finish</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
