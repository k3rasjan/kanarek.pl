package edu.zsk.myapplication;
import java.util.List;
public class FindVehicleRequest {
    public List<LocationData> locations;

    public FindVehicleRequest(List<LocationData> locations) {
        this.locations = locations;
    }
}
