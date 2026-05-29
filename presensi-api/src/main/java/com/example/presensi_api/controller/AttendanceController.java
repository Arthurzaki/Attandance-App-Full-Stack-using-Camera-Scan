package com.example.presensi_api.controller; // Tambahkan .presensi_api

import com.example.presensi_api.model.Attendance; // Tambahkan .presensi_api
import com.example.presensi_api.repository.AttendanceRepository; // Tambahkan .presensi_api
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import com.example.presensi_api.service.GeoService;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*") // Agar bisa diakses dari perangkat luar (HP)
public class AttendanceController {

    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Autowired
    private GeoService geoService;

    // Endpoint untuk Simpan Absen (POST)
    @PostMapping
    public Attendance saveAttendance(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    // Endpoint untuk Ambil Riwayat dengan Pagination (GET)
    @GetMapping
    public Page<Attendance> getAllAttendance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return attendanceRepository.findAll(PageRequest.of(page, size));
    }

    @PostMapping("/locate")
    public String locate(@RequestBody Map<String, Object> request) {
    double lat = Double.parseDouble(request.get("lat").toString());
    double lng = Double.parseDouble(request.get("lng").toString());

    boolean inside = geoService.isInside(lat, lng);

    return inside ? "IN AREA" : "OUT AREA";
    }
}