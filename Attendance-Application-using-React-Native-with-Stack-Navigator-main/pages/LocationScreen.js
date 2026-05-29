import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

// Ganti IP ini pakai IP laptop lu
const BASE_URL = "http://10.1.10.110:8080/api/attendance";

export default function LocationScreen() {
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapStatus, setMapStatus] = useState("-");

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Ditolak", "Izin lokasi diperlukan.");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = currentLocation.coords;

      const initialRegion = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setLocation(coords);
      setSelectedLocation(coords);
      setRegion(initialRegion);
    } catch (error) {
      console.log("LOCATION ERROR:", error);
      Alert.alert("Error", "Gagal mengambil lokasi.");
    } finally {
      setLoading(false);
    }
  };

  const handlePressMap = (event) => {
    setSelectedLocation(event.nativeEvent.coordinate);
  };

  const handleFocusUser = () => {
    if (!location) return;

    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);
    setSelectedLocation(location);
  };

  const handleCheckLocation = async () => {
    try {
      if (!selectedLocation) {
        Alert.alert("Info", "Pilih lokasi terlebih dahulu.");
        return;
      }

      const response = await axios.post(`${BASE_URL}/locate`, {
        lat: selectedLocation.latitude.toString(),
        lng: selectedLocation.longitude.toString(),
      });

      setMapStatus(response.data);
      Alert.alert("Hasil Validasi", response.data);
    } catch (error) {
      console.log("API ERROR:", error.message);
      Alert.alert("Error", "Gagal validasi lokasi ke server.");
    }
  };

  if (loading || !region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Your Location</Text>

        <Text style={styles.value}>
          Lat: {selectedLocation?.latitude}
        </Text>

        <Text style={styles.value}>
          Lng: {selectedLocation?.longitude}
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => setMapVisible(true)}>
          <Text style={styles.primaryText}>Choose Location</Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleCheckLocation}>
          <Text style={styles.primaryText}>Check My Location</Text>
        </Pressable>

        <Text style={styles.value}>Area: {mapStatus}</Text>
      </View>

      <Modal visible={mapVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            onPress={handlePressMap}
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} />
            )}
          </MapView>

          <View style={styles.floating}>
            <Pressable onPress={handleFocusUser} style={styles.circleButton}>
              <Text style={styles.icon}>⌖</Text>
            </Pressable>

            <Pressable onPress={() => setMapVisible(false)} style={styles.circleButtonConfirm}>
              <Text style={styles.iconConfirm}>✓</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  value: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
  muted: {
    marginTop: 8,
    color: "#888",
  },
  primaryButton: {
    marginTop: 15,
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
  },
  floating: {
    position: "absolute",
    right: 16,
    bottom: 24,
    gap: 12,
  },
  circleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  circleButtonConfirm: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#02C55E",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    color: "#222",
  },
  iconConfirm: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});