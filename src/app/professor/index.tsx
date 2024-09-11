import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import ProximaReuniao from '@/components/ProximaReuniao';
import Calendario from '@/components/Calendario';
import { useAuth } from '@/app/context/AuthContext';

const Painel = () => {
  const { onLogout } = useAuth();  // Contexto de autenticação para logout

  const components = [
    { key: 'ProximaReuniao', component: <ProximaReuniao /> },
    { key: 'Calendario', title: 'Calendário', component: <Calendario isProfessor={true} /> },  // Componente com isProfessor=true
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={components}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.component}
          </View>
        )}
        contentContainerStyle={styles.contentContainer}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d', // Cor de fundo para o botão
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Painel;
