package edu.zsk.myapplication;
import com.google.gson.annotations.SerializedName;

public class Vehicle {
    public String id;
    public String tripId;
    public String routeId;
    public double lat;
    @SerializedName("long")
    public double long_;
    public int directionId;
    public boolean hasInspector;
}
