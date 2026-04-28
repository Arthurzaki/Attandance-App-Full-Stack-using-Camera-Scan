import React, { useState, useEffect, useMemo, useRef } from "react"; // Gunakan useMemo & useRef [cite: 65, 68, 69]
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const Home = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState("Memuat jam...");
  const [note, setNote] = useState(""); 
  
  // 1. Menggunakan useRef untuk referensi input catatan [cite: 92]
  const noteInputRef = useRef(null);

  // 2. Menggunakan useMemo untuk statistik (Simulasi sesuai modul) [cite: 95, 96]
  const attendanceStats = useMemo(() => {
    return { totalPresent: 12, totalAbsent: 2 };
  }, []);

  // Efek Jam Real-time [cite: 106, 107]
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    if (isCheckedIn) return Alert.alert("Perhatian", "Anda sudah Check In."); 

    // Validasi catatan menggunakan useRef [cite: 114]
    if (note.trim() === "") {
      Alert.alert("Peringatan", "Catatan kehadiran wajib diisi!");
      noteInputRef.current.focus(); // Mengarahkan kursor ke input [cite: 114]
      return;
    }

    setIsCheckedIn(true);
    Alert.alert("Sukses", `Berhasil Check In pada pukul ${currentTime}`); 
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header [cite: 120] */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Attendance App</Text>
          <Text style={styles.clockText}>{currentTime}</Text>
        </View>

        
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={40} color="#555" />
          </View>
          <View>
            <Text style={styles.studentName}>Zaki Fathur</Text>
            <Text style={styles.studentDetail}>NIM : 0920240025</Text>
            <Text style={styles.studentDetail}>Class : TRPL- 2B</Text>
          </View>
        </View>

        {/* Today's Class Card [cite: 120] */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Today's Class</Text>
          <Text style={styles.courseName}>Mobile Programming</Text>
          <Text style={styles.classDetail}>08:00 - 10:00</Text>
          <Text style={styles.classDetail}>Lab 3</Text>

          {!isCheckedIn && (
            <TextInput
              ref={noteInputRef} // Pasang ref di sini [cite: 120]
              style={styles.input}
              placeholder="Tulis catatan (cth: Hadir lab)"
              value={note}
              onChangeText={setNote}
            />
          )}

          <TouchableOpacity
            style={[styles.button, isCheckedIn ? styles.buttonDisabled : styles.buttonActive]}
            onPress={handleCheckIn}
            disabled={isCheckedIn}
          >
            <Text style={styles.buttonText}>{isCheckedIn ? "CHECKED IN" : "CHECK IN"}</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card menggunakan data dari useMemo [cite: 130] */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryNumber, { color: "#4CAF50" }]}>
                {attendanceStats.totalPresent}
            </Text>
            <Text style={styles.summaryLabel}>Total Present</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={[styles.summaryNumber, { color: "#F44336" }]}>
                {attendanceStats.totalAbsent}
            </Text>
            <Text style={styles.summaryLabel}>Total Absent</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F5F5F5" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  clockText: { fontSize: 16, fontWeight: "bold", color: "#4A80F0" },
  card: { flexDirection: "row", backgroundColor: "#FFF", padding: 15, borderRadius: 12, elevation: 2, marginBottom: 20, alignItems: "center" },
  avatarCircle: { backgroundColor: "#EEE", padding: 10, borderRadius: 50, marginRight: 15 },
  studentName: { fontSize: 17, fontWeight: "bold" },
  studentDetail: { fontSize: 13, color: "#666" },
  mainCard: { backgroundColor: "#FFF", padding: 15, borderRadius: 12, elevation: 2, marginBottom: 20 },
  cardTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 10 },
  courseName: { fontSize: 15, fontWeight: "bold" },
  classDetail: { fontSize: 14, color: "#444" },
  input: { backgroundColor: "#F0F0F0", padding: 12, borderRadius: 8, marginTop: 15, fontSize: 14 },
  button: { marginTop: 15, padding: 13, borderRadius: 8, alignItems: "center" },
  buttonActive: { backgroundColor: "#4A80F0" },
  buttonDisabled: { backgroundColor: "#A0C4FF" },
  buttonText: { color: "#FFF", fontWeight: "bold" },
  summaryCard: { flexDirection: "row", backgroundColor: "#FFF", padding: 15, borderRadius: 12, elevation: 2, marginBottom: 20 },
  summaryBox: { flex: 1, alignItems: "center" },
  summaryNumber: { fontSize: 24, fontWeight: "bold" },
  summaryLabel: { fontSize: 12, color: "#888" },
});

export default Home;