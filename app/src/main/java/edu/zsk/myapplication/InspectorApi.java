package edu.zsk.myapplication;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface InspectorApi {
    @POST("inspector/find-vehicle")
    Call<VehicleResponse> findVehicle(@Body FindVehicleRequest request);

    @POST("inspector/report")
    Call<Void> reportVehicle(@Body ReportRequest request);

    @GET("vehicles/get-positions")
    Call<VehicleListResponse> getAllVehicles();
}