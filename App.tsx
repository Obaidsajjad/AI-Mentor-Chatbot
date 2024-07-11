import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { TextInput, Button, Text, Provider as PaperProvider, DefaultTheme, DarkTheme, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import { NetworkInfo } from 'react-native-network-info';
import { SafeAreaProvider, SafeAreaInsetsContext } from 'react-native-safe-area-context';

const API_URL = process.env.REACT_APP_API_URL; // Use environment variable for API URL

const App = () => {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState([]);
  const [ipaddress, setipaddress] = useState('');
  const scheme = useColorScheme();

  useEffect(() => {
    NetworkInfo.getIPV4Address().then(ipv4 => setipaddress(ipv4));
  }, []);

  const handleSend = async () => {
    try {
      const response = await axios.post(`http://192.168.23.245:8000/chat`, { prompt });
      setResponses([...responses, { prompt, response: response.data.response, isUser: true }]);
      setPrompt('');
      setResponses((prevResponses) => [...prevResponses, { response: response.data.response, isUser: false }]);
    } catch (error) {
      console.error('Error sending prompt:', error);
    }
  };

  const theme = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <SafeAreaProvider>
      <View style={{ height: 50, backgroundColor: "darkblue", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 20 }}>AI MENTOR</Text>
      </View>
      <PaperProvider theme={theme}>
        <SafeAreaInsetsContext.Consumer>
          {insets => (
            <SafeAreaView style={{ ...styles.safeArea, paddingTop: insets.top, paddingBottom: insets.bottom }}>
              <ScrollView style={styles.scrollView}>
                {responses.map((item, index) => (
                  <ChatMessage key={index} item={item} styles={styles} /> // Use ChatMessage component
                ))}
              </ScrollView>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="Type your message"
                />
                <Button mode="contained" onPress={handleSend} style={styles.sendButton}>
                  Send
                </Button>
              </View>
            </SafeAreaView>
          )}
        </SafeAreaInsetsContext.Consumer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const ChatMessage = ({ item, styles }) => {
  const [isThinking, setIsThinking] = useState(false); // State for bot thinking animation

  useEffect(() => {
    if (!item.isUser) { // Only simulate thinking for bot responses
      setIsThinking(true);
      const timeoutId = setTimeout(() => setIsThinking(false), 2000); // 2-second latency
      return () => clearTimeout(timeoutId); // Cleanup function to prevent memory leaks
    }
  }, [item]);

  return (
    <View key={item.index} style={item.isUser ? styles.userMessageContainer : styles.aiMessageContainer}>
      {isThinking ? (
        <ActivityIndicator size="small" color="#ccc" style={styles.thinkingIndicator} /> // Thinking animation
      ) : (
        <Text style={styles.messageText}>{item.isUser ? item.prompt : item.response}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    padding: 2,
    borderRadius: 4,
    borderColor: "#ddd"
  },
sendButton: {
      paddingVertical: 8,
     },
userMessageContainer: {
  marginVertical: 8,
  padding: 10,
  backgroundColor: '#dcf8c6',
  borderRadius: 10,
  alignSelf: 'flex-end',
  maxWidth: '80%',
  },
aiMessageContainer: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
    },
messageText: {
    fontSize: 16,
    },
    });
    
export default App;
