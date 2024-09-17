import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';
import { API_URL } from '@/app/context/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { router } from 'expo-router';

// Extende dayjs para suportar fuso horário
dayjs.extend(utc);
dayjs.extend(timezone);

interface Reuniao {
  _id: string;
  date: string;
  timeSlot: string;
  reason: string;
  canceled?: boolean; // Propriedade opcional
  cancelReason?: string; // Propriedade opcional para o motivo do cancelamento
}

const ReunioesMarcadas = () => {
  const { authState } = useAuth();
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelarReuniaoId, setCancelarReuniaoId] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState<string>('');

  useEffect(() => {
    const fetchReunioes = async () => {
      try {
        if (authState.user && authState.user._id) {
          console.log('Buscando todas as reuniões futuras para o professor:', authState.user._id);

          const response = await axios.get(`${API_URL}/meeting/allFutureForProfessor`);
          console.log('Resposta da API com todas as reuniões:', response.data);

          let reunioesData: Reuniao[] = [];

          if (Array.isArray(response.data)) {
            reunioesData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            reunioesData = [response.data];
          }

          const filteredReunioes = reunioesData.filter((reuniao) => !reuniao.canceled);
          setReunioes(filteredReunioes);
        }
      } catch (error) {
        console.error('Erro ao buscar reuniões:', error);
        setError('Erro ao buscar reuniões');
      } finally {
        setLoading(false);
      }
    };

    fetchReunioes();
  }, [authState]);

  const handleCancelar = async () => {
    if (!motivoCancelamento.trim()) {
      alert('Por favor, insira o motivo do cancelamento.');
      return;
    }

    try {
      await axios.patch(`${API_URL}/meeting/${cancelarReuniaoId}/cancel`, { reason: motivoCancelamento });
      setReunioes((prevReunioes) => prevReunioes.filter((reuniao) => reuniao._id !== cancelarReuniaoId));
      alert('Reunião cancelada com sucesso.');
      setCancelarReuniaoId(null);
      setMotivoCancelamento('');
    } catch (error) {
      console.error('Erro ao cancelar a reunião:', error);
      alert('Erro ao cancelar a reunião.');
    }
  };

  if (loading) {
    return <Text>Carregando reuniões...</Text>;
  }

  if (error) {
    return <Text>Erro: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {reunioes.length > 0 ? (
        reunioes.map((reuniao) => (
          <View key={reuniao._id} style={styles.reuniaoContainer}>
            <Text>Data: {reuniao.date}</Text>
            <Text>Hora: {reuniao.timeSlot}</Text>
            <Text>Motivo: {reuniao.reason}</Text>

            {cancelarReuniaoId === reuniao._id ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Motivo do cancelamento"
                  value={motivoCancelamento}
                  onChangeText={setMotivoCancelamento}
                />
                <TouchableOpacity style={styles.confirmButton} onPress={handleCancelar}>
                  <Text style={styles.buttonText}>Confirmar cancelamento</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelarReuniaoId(null)}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelarReuniaoId(reuniao._id)}>
                <Text style={styles.buttonText}>Desmarcar reunião</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      ) : (
        <Text>Sem reuniões futuras marcadas</Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/professor')}>
        <Text style={styles.buttonText}>Voltar ao Calendário</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  reuniaoContainer: {
    marginBottom: 20,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReunioesMarcadas;
