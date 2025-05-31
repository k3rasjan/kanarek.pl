package edu.zsk.myapplication;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface InspectorApi {
    @POST("/inspector/find-vehicle")
    Call<Vehicle> findVehicle(@Body FindVehicleRequest request);

    @POST("/inspector/report")
    Call<Void> reportVehicle(@Body ReportRequest request);
}