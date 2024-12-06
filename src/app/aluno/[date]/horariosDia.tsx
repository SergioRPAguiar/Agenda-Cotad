import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL, useAuth } from '@/app/context/AuthContext';
import { useDate } from '@/app/context/DateContext';
import Botao from '@/components/Botao';

interface Horario {
  timeSlot: string;
  available: boolean;
}

const HorariosDia = () => {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const { selectedDate, setSelectedDate } = useDate();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [motivo, setMotivo] = useState('');
  const [selectedHorario, setSelectedHorario] = useState<string | null>(null);
  const { authState } = useAuth();
  const token = authState.token;
  const [motivoInvalido, setMotivoInvalido] = useState(false);

  useEffect(() => {
    if (date) {
      setSelectedDate(date as string);
    }
  }, [date]);

  const fetchHorarios = async (selectedDate: string) => {
    try {
      const response = await axios.get(`${API_URL}/schedule/available/${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedHorarios = response.data.sort((a: Horario, b: Horario) => a.timeSlot.localeCompare(b.timeSlot));
      setHorarios(sortedHorarios);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchHorarios(selectedDate);
    }
  }, [selectedDate]);

  const confirmarReuniao = async () => {
    if (!authState.user) {
      console.error("Usuário não autenticado");
      return;
    }
    if (!motivo.trim()) {
      setMotivoInvalido(true);
      return;
    }
    setMotivoInvalido(false);

    try {
      await axios.post(
        `${API_URL}/meeting`,
        {
          date: selectedDate,
          timeSlot: selectedHorario,
          reason: motivo,
          userId: authState.user._id
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          }
        }
      );
      router.replace('/aluno');
    } catch (error) {
      console.error('Erro ao marcar reunião:', error);
    }
  };

  const handleSelectHorario = (horario: string) => {
    setSelectedHorario(selectedHorario === horario ? null : horario);
    setMotivoInvalido(false);
    setMotivo('');
  };

  const handleInputFocus = () => {
    setMotivoInvalido(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Horários Disponíveis</Text>
        <Text style={styles.dateText}>Data selecionada: {selectedDate}</Text>

        {horarios.length > 0 ? (
          horarios.map((horario, index) => (
            <View key={index} style={styles.horarioContainer}>
              <View style={styles.row}>
                <Text style={styles.horarioText}>{horario.timeSlot}</Text>
                <Checkbox
                  status={selectedHorario === horario.timeSlot ? 'checked' : 'unchecked'}
                  onPress={() => handleSelectHorario(horario.timeSlot)}
                  disabled={!horario.available}
                  color="#008739"
                />
              </View>
              {selectedHorario === horario.timeSlot && (
                <View style={styles.motivoContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      motivoInvalido && { borderColor: 'red' }
                    ]}
                    placeholder="Motivo da reunião"
                    value={motivo}
                    onChangeText={setMotivo}
                    multiline
                    onFocus={handleInputFocus}
                  />
                  {motivoInvalido && (
                    <Text style={styles.errorText}>Motivo obrigatório. Por favor, preencha este campo.</Text>
                  )}
                  <Botao title="Marcar Reunião" onPress={confirmarReuniao} />
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noHorariosText}>Nenhum horário disponível para esta data.</Text>
        )}
      </ScrollView>

      <View style={styles.footerContainer}>
        <Botao title="Voltar para o Calendário" onPress={() => router.replace('/aluno')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerText: {
    paddingTop: 30,
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#008739'
  },
  dateText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  horarioContainer: {
    marginBottom: 15,
    padding: 10,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  horarioText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  motivoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  noHorariosText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 20,
    textAlign: 'center',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

export default HorariosDia;
