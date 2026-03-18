import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart'; // New import
import 'package:location/location.dart';
import 'dart:io' show Platform;
import 'package:provider/provider.dart'; // New import


class MapScreen extends StatefulWidget {
  const MapScreen({super.key});
  @override
  MapScreenState createState() => MapScreenState();
}

class MapScreenState extends State<MapScreen> {
  GoogleMapController? mapController;
  final Location _location = Location();
  LatLng _initialPosition = LatLng(0, 0);

  bool _serviceEnabled = false;
  PermissionStatus _permissionGranted = PermissionStatus.denied;
  LocationData? _locationData;
  StreamSubscription<LocationData>? _locationSubscription;
  late SocketService _socketService; // New declaration

  @override
  void initState() {
    super.initState();
    // No socket related stuff here, moved to didChangeDependencies
    if (!Platform.isLinux) {
      _startLocationTracking();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _socketService = Provider.of<SocketService>(context, listen: false);
    _socketService.connectSocket();
    _socketService.joinDeliveryRoom('test_delivery_id'); // Hardcoded for now
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _startLocationTracking() async {
    if (Platform.isLinux) {
      return; // Early exit for Linux platform
    }
    _serviceEnabled = await _location.serviceEnabled();
    if (!_serviceEnabled) {
      _serviceEnabled = await _location.requestService();
      if (!_serviceEnabled) {
        return;
      }
    }

    _permissionGranted = await _location.hasPermission();
    if (_permissionGranted == PermissionStatus.denied) {
      _permissionGranted = await _location.requestPermission();
      if (_permissionGranted != PermissionStatus.granted) {
        return;
      }
    }

    _locationSubscription = _location.onLocationChanged.listen((LocationData currentLocation) {
      setState(() {
        _locationData = currentLocation;
        if (mapController != null && currentLocation.latitude != null && currentLocation.longitude != null) {
          mapController!.animateCamera(
            CameraUpdate.newLatLng(
              LatLng(currentLocation.latitude!, currentLocation.longitude!),
            ),
          );
          _initialPosition = LatLng(currentLocation.latitude!, currentLocation.longitude!);
          // Emit location update to the server (hardcoded as client for now)
          _socketService.emitClientLocationUpdate('test_delivery_id', currentLocation.latitude!, currentLocation.longitude!);
        }
      });
    });
    
  }

  void _onMapCreated(GoogleMapController controller) {
    mapController = controller;
    if (_locationData != null && _locationData!.latitude != null && _locationData!.longitude != null) {
      mapController!.animateCamera(
        CameraUpdate.newLatLng(
          LatLng(_locationData!.latitude!, _locationData!.longitude!),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Live Location'),
      ),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        initialCameraPosition: CameraPosition(
          target: _initialPosition,
          zoom: 15.0,
        ),
        myLocationEnabled: true,
        myLocationButtonEnabled: true,
      ),
    );
  }
}
