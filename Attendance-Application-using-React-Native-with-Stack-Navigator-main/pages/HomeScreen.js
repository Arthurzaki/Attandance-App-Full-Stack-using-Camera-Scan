import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

const Home = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // State lokasi
  const [locationStatus, setLocationStatus] = useState("checking");
  // checking, valid, invalid, error
  const [distance, setDistance] = useState(0);

  // GANTI IP INI SESUAI IPv4 LAPTOP LU
  const BASE_URL = "http://10.207.130.26:8080/api/attendance";

  // Koordinat titik absen/kampus
  // Pakai koordinat yang kemarin sudah valid di HP lu
  const KAMPUS_LAT = -6.3480393;
  const KAMPUS_LON = 107.1481945;

  // Untuk testing bisa ubah jadi 250 atau 500
  const MAKSIMAL_JARAK_METER = 50;

  useEffect(() => {
    if (permission && permission.granted) {
      verifyLocation();
    }
  }, [permission]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meter
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const deltaP = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
      Math.cos(p1) *
        Math.cos(p2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const verifyLocation = async () => {
    setLocationStatus("checking");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Akses Ditolak",
          "Izin lokasi wajib diberikan untuk presensi."
        );
        setLocationStatus("error");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const jarakMeter = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        KAMPUS_LAT,
        KAMPUS_LON
      );

      setDistance(Math.round(jarakMeter));

      if (jarakMeter <= MAKSIMAL_JARAK_METER) {
        setLocationStatus("valid");
      } else {
        setLocationStatus("invalid");
      }
    } catch (error) {
      console.log("LOCATION ERROR:", error);
      Alert.alert("Error Lokasi", "Gagal mengunci posisi GPS Anda.");
      setLocationStatus("error");
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (!isScanning) return;

    setIsScanning(false);

    Alert.alert(
      "QR Code Terdeteksi",
      `Data QR:\n${data}\n\nApakah ingin Check In?`,
      [
        {
          text: "Batal",
          style: "cancel",
          onPress: () => setIsScanning(true),
        },
        {
          text: "Ya, Check In",
          onPress: () => handleCheckIn(data),
        },
      ]
    );
  };

  const handleCheckIn = async (qrData) => {
    try {
      let parsedQR = {};

      try {
        parsedQR = JSON.parse(qrData);
      } catch (error) {
        parsedQR = {
          matakuliah: "Mobile Programming",
          dosen: "Tim Dosen TRPL",
        };
      }

      const payload = {
        nim: "0920240025",
        nama: "Zaki Fathur",
        kodeMk: parsedQR.kodeMk || "PRG6",
        matakuliah: parsedQR.matakuliah || "Mobile Programming",
        pertemuan: parsedQR.pertemuan || "7",
        ruangan: parsedQR.ruangan || "Lab 3",
        dosen: parsedQR.dosen || "Tim Dosen TRPL",
        tanggal: new Date().toISOString().split("T")[0],
        jamPresensi: new Date().toLocaleTimeString("id-ID"),
        status: "Present",
      };

      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gagal menyimpan presensi");
      }

      setIsCheckedIn(true);
      Alert.alert("Sukses", "Berhasil Check In dan data tersimpan.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Gagal mengirim data ke backend.");
    } finally {
      setIsScanning(true);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Memuat izin kamera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <MaterialIcons name="camera-alt" size={60} color="#4A80F0" />
        <Text style={styles.permissionText}>
          Aplikasi membutuhkan akses kamera untuk scan QR Code presensi.
        </Text>

        <TouchableOpacity style={styles.buttonActive} onPress={requestPermission}>
          <Text style={styles.buttonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (locationStatus === "checking") {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0056b3" />
        <Text style={styles.loadingText}>Memverifikasi Lokasi Anda...</Text>
        <Text style={styles.infoText}>
          Pastikan Anda berada di area absen.
        </Text>
      </SafeAreaView>
    );
  }

  if (locationStatus === "invalid") {
    return (
      <SafeAreaView style={styles.center}>
        <MaterialIcons
          name="block"
          size={80}
          color="#dc3545"
          style={{ marginBottom: 15 }}
        />

        <Text style={styles.errorTitle}>Akses Ditolak</Text>

        <Text style={styles.errorSubtitle}>
          Anda terdeteksi berada {distance} meter dari titik absen. Maksimal
          jarak yang diizinkan adalah {MAKSIMAL_JARAK_METER} meter.
        </Text>

        <TouchableOpacity style={styles.buttonActive} onPress={verifyLocation}>
          <Text style={styles.buttonText}>Cek Ulang Lokasi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (locationStatus === "error") {
    return (
      <SafeAreaView style={styles.center}>
        <MaterialIcons
          name="location-off"
          size={80}
          color="#dc3545"
          style={{ marginBottom: 15 }}
        />

        <Text style={styles.errorTitle}>Lokasi Bermasalah</Text>

        <Text style={styles.errorSubtitle}>
          Sistem gagal mendapatkan lokasi Anda. Aktifkan GPS lalu coba lagi.
        </Text>

        <TouchableOpacity style={styles.buttonActive} onPress={verifyLocation}>
          <Text style={styles.buttonText}>Cek Ulang Lokasi</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          isScanning && !isCheckedIn ? handleBarcodeScanned : undefined
        }
      />

      <View style={styles.overlay}>
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Attendance App</Text>
          <Text style={styles.headerSubTitle}>Scan QR Code Presensi</Text>
        </View>

        <View style={styles.validLocationBadge}>
          <MaterialIcons
            name="check-circle"
            size={18}
            color="white"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.validLocationText}>
            Lokasi Valid ({distance}m)
          </Text>
        </View>

        <View style={styles.scanBox} />

        <Text style={styles.scanText}>Arahkan kamera ke QR Code dosen</Text>

        {isCheckedIn && (
          <View style={styles.successBox}>
            <MaterialIcons name="check-circle" size={45} color="#4CAF50" />
            <Text style={styles.successText}>CHECKED IN</Text>
          </View>
        )}

        {!isScanning && !isCheckedIn && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setIsScanning(true)}
          >
            <Text style={styles.buttonText}>Scan Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    color: "#333",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  infoText: {
    color: "gray",
    marginTop: 10,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerBox: {
    position: "absolute",
    top: 60,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubTitle: {
    fontSize: 15,
    color: "#DDD",
    marginTop: 5,
  },
  validLocationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 167, 69, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 30,
  },
  validLocationText: {
    color: "white",
    fontWeight: "bold",
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: "#4A80F0",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scanText: {
    color: "#FFF",
    fontSize: 16,
    marginTop: 25,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonActive: {
    backgroundColor: "#4A80F0",
    paddingVertical: 13,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 13,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  successBox: {
    marginTop: 25,
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  successText: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
});

export default Home;