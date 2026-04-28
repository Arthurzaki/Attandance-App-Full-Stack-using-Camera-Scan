import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Data awal (Dummy)
const initialHistory = [
  { id: "1", course: "Web Programming", date: "2026-03-01", status: "Absent", room: "Lab 1", lecturer: "Bpk. Andi" },
  { id: "2", course: "Database System", date: "2026-03-02", status: "Present", room: "Lab 2", lecturer: "Ibu Rina" },
];

export default function HistoryScreen({ navigation }) {
  const [historyData, setHistoryData] = useState(initialHistory);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk mensimulasikan pengambilan data tambahan (Infinite Scroll)
  const loadMoreData = () => {
    if (isLoading) return; // Mencegah double loading

    setIsLoading(true);

    // Simulasi loading selama 2 detik
    setTimeout(() => {
      const newItems = [
        { 
          id: Date.now().toString(), 
          course: `Mata Kuliah #${historyData.length + 1}`, 
          date: "2026-04-14", 
          status: historyData.length % 2 === 0 ? "Present" : "Absent",
          room: "Lab 3",
          lecturer: "Dosen Tamu"
        },
      ];

      // Konsep Spread Operator sesuai poin evaluasi modul
      setHistoryData([...historyData, ...newItems]);
      setIsLoading(false);
    }, 2000);
  };

  // Komponen loading di bagian bawah list
  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4285F4" />
        <Text style={styles.loaderText}>Memuat riwayat lama...</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate("Detail", { dataPresensi: item })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.course}>{item.course}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={item.status === "Present" ? styles.present : styles.absent}>
        {item.status}
      </Text>
      <MaterialIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        
        // Konfigurasi Infinite Scroll sesuai modul
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5} // 0.5 berarti mulai muat saat scroll tersisa setengah
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: { padding: 20 },
  item: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "white", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10, 
    elevation: 2 
  },
  course: { fontSize: 16, fontWeight: "bold", color: "#333" },
  date: { fontSize: 12, color: "gray", marginTop: 4 },
  present: { color: "green", fontWeight: "bold", marginRight: 5 },
  absent: { color: "red", fontWeight: "bold", marginRight: 5 },
  footerLoader: { 
    paddingVertical: 20, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center' 
  },
  loaderText: { marginLeft: 10, color: '#666', fontSize: 12 },
});