import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Checkbox } from "react-native-paper";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_URL, useAuth } from "@/app/context/AuthContext";
import { useDate } from "@/app/context/DateContext";
import Botao from "@/components/Botao";
import BackButton from "@/components/BackButton";

const Noite = () => {
  const router = useRouter();
  const { date } = useLocalSearchParams();
  const { selectedDate, setSelectedDate } = useDate();
  const { authState } = useAuth();
  const token = authState.token;

  const [horarios, setHorarios] = useState([
    { time: "18:00 - 18:15", available: false },
    { time: "18:15 - 18:30", available: false },
    { time: "18:30 - 18:45", available: false },
    { time: "18:45 - 19:00", available: false },
    { time: "19:00 - 19:15", available: false },
    { time: "19:15 - 19:30", available: false },
    { time: "19:30 - 19:45", available: false },
    { time: "19:45 - 20:00", available: false },
    { time: "20:00 - 20:15", available: false },
    { time: "20:15 - 20:30", available: false },
    { time: "20:30 - 20:45", available: false },
    { time: "20:45 - 21:00", available: false },
    { time: "21:00 - 21:15", available: false },
    { time: "21:15 - 21:30", available: false },
    { time: "21:30 - 21:45", available: false },
    { time: "21:45 - 22:00", available: false },
  ]);

  useEffect(() => {
    if (date) {
      setSelectedDate(date as string);
    }
  }, [date]);

  const fetchHorarios = async (selectedDate: string) => {
    try {
      const response = await axios.get(`${API_URL}/schedule/available/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const completeHorarios = horarios.map(horario => ({
        ...horario,
        available: response.data.some((h: any) => h.timeSlot === horario.time)
      }));
  
      setHorarios(completeHorarios);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchHorarios(selectedDate);
    }
  }, [selectedDate]);

  const toggleDisponibilidade = async (index: number) => {
    const newHorarios = [...horarios];
    const newAvailability = !newHorarios[index].available;
    
    try {
      await axios.post(
        `${API_URL}/schedule`,
        {
          date: selectedDate,
          timeSlot: newHorarios[index].time,
          available: newAvailability
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (!newAvailability) {
        newHorarios.splice(index, 1);
      } else {
        newHorarios[index].available = newAvailability;
      }
      
      setHorarios(newHorarios);
  
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      const restoredHorarios = [...horarios];
      restoredHorarios[index].available = !newAvailability;
      setHorarios(restoredHorarios);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Horários da Noite</Text>
        <Text style={styles.headerText2}>Data selecionada: {selectedDate}</Text>

        {horarios.map((horario, index) => (
          <View key={index} style={styles.horarioContainer}>
            <Text style={styles.text}>{horario.time}</Text>
            <Checkbox
              status={horario.available ? "checked" : "unchecked"}
              onPress={() => toggleDisponibilidade(index)}
              color={horario.available ? "#008739" : "#ccc"}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footerContainer}>
        <Botao
          title="Voltar para o Calendário"
          onPress={() => router.replace("/professor")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  headerText: {
    paddingTop: 30,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#008739",
  },
  headerText2: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    borderBottomColor: "#7c7c7c",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  horarioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
  },
  footerContainer: {
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderTopColor: "#ddd",
  },
});

export default Noite;
