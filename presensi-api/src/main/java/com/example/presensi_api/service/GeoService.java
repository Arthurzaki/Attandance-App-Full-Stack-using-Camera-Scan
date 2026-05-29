package com.example.presensi_api.service;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.springframework.stereotype.Service;

@Service
public class GeoService {

    private final GeometryFactory geometryFactory = new GeometryFactory();
    private final Polygon polygon;

    public GeoService() {
        Coordinate[] coordinates = new Coordinate[] {
                new Coordinate(107.147500, -6.347500),
                new Coordinate(107.149000, -6.347500),
                new Coordinate(107.149000, -6.348800),
                new Coordinate(107.147500, -6.348800),
                new Coordinate(107.147500, -6.347500)
        };

        this.polygon = geometryFactory.createPolygon(coordinates);
    }

    public boolean isInside(double lat, double lng) {
        Point point = geometryFactory.createPoint(new Coordinate(lng, lat));
        return polygon.contains(point) || polygon.touches(point);
    }
}