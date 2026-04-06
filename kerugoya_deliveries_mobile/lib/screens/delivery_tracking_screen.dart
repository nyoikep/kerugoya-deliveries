import 'dart:async'; // For StreamSubscription

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart'; // Import Google Maps
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart'; // For AuthProvider to get userId from token
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart'; // Import SocketService
import 'package:location/location.dart'; // Import Location package
import 'package:provider/provider.dart';

class DeliveryTrackingScreen extends StatefulWidget {
  const DeliveryTrackingScreen({super.key});

  @override
  State<DeliveryTrackingScreen> createState() => _DeliveryTrackingScreenState();
}

class _DeliveryTrackingScreenState extends State<DeliveryTrackingScreen> {
  List<DeliveryRequest> _activeDeliveries = [];
  bool _isLoading = true;
  String? _error;
  final Location _location = Location();
  StreamSubscription<LocationData>? _locationSubscription;
  LocationData? _currentClientLocation;
  final Map<String, LatLng> _riderLocations = {}; // Map deliveryId to rider's LatLng
  GoogleMapController? _mapController; // Made nullable
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _fetchActiveDeliveries();
    _initLocationTracking();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchActiveDeliveries() async {
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      final deliveries = await deliveryService.getClientDeliveryRequests();
      setState(() {
        _activeDeliveries = deliveries.where((d) => d.status == 'ACCEPTED' || d.status == 'IN_PROGRESS').toList();
        _isLoading = false;
      });
      _setupSocketListeners();
    } on HttpException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load active deliveries: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  Future<void> _initLocationTracking() async {
    bool serviceEnabled;
    PermissionStatus permissionGranted;

    serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _location.requestService();
      if (!serviceEnabled) {
        // Location services are not enabled.
        return;
      }
    }

    permissionGranted = await _location.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _location.requestPermission();
      if (permissionGranted != PermissionStatus.granted) {
        // Location permissions are denied.
        return;
      }
    }

    _locationSubscription = _location.onLocationChanged.listen((LocationData currentLocation) {
      setState(() {
        _currentClientLocation = currentLocation;
        _updateMarkers();
      });
      _emitClientLocation(currentLocation);
    });
  }

  void _setupSocketListeners() {
    final socketService = Provider.of<SocketService>(context, listen: false);

    // Connect socket if not already connected
    if (socketService.socket == null || !socketService.socket!.connected) {
      socketService.connectSocket();
    }

    // Register connect handler to join rooms once connected
    socketService.socket?.on('connect', (_) {
      debugPrint('Socket re-connected, joining rooms...');
      for (var delivery in _activeDeliveries) {
        socketService.socket?.emit('joinDeliveryRoom', delivery.id);
      }
    });

    // If already connected, join rooms immediately
    if (socketService.socket!.connected) {
      debugPrint('Socket already connected, joining rooms...');
      for (var delivery in _activeDeliveries) {
        socketService.socket?.emit('joinDeliveryRoom', delivery.id);
      }
    }

    socketService.socket?.on('rider_location_broadcast', (data) {
      final deliveryId = data['deliveryId'];
      final latitude = data['latitude'];
      final longitude = data['longitude'];
      if (deliveryId != null && latitude != null && longitude != null) {
        setState(() {
          _riderLocations[deliveryId] = LatLng(latitude, longitude);
          _updateMarkers();
        });
      }
    });
  }

  void _emitClientLocation(LocationData locationData) {
    final socketService = Provider.of<SocketService>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (socketService.socket != null && socketService.socket!.connected && authProvider.isAuthenticated) {
      // We need to link the location update to a specific active delivery for the client
      // For now, let's assume one active delivery is enough, or iterate
      for (var delivery in _activeDeliveries) {
        socketService.socket!.emit('client_location_update', {
          'deliveryId': delivery.id,
          'latitude': locationData.latitude,
          'longitude': locationData.longitude,
        });
      }
    }
  }

  void _updateMarkers() {
    _markers.clear();
    if (_currentClientLocation != null) {
      _markers.add(Marker(
        markerId: const MarkerId('clientLocation'),
        position: LatLng(_currentClientLocation!.latitude!, _currentClientLocation!.longitude!),
        infoWindow: const InfoWindow(title: 'Your Location'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ));
    }

    for (final entry in _riderLocations.entries) {
      _markers.add(Marker(
        markerId: MarkerId('rider_${entry.key}'),
        position: entry.value,
        infoWindow: InfoWindow(title: 'Rider for ${entry.key.substring(0, 8)}...'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ));
    }
    // If _mapController is available, animate camera to show both client and rider
    if (_mapController != null && _currentClientLocation != null && _riderLocations.isNotEmpty) {
      LatLngBounds bounds = _getLatLngBounds();
      _mapController?.animateCamera(CameraUpdate.newLatLngBounds(bounds, 50));
    }
    setState(() {}); // Trigger rebuild to update markers
  }

  LatLngBounds _getLatLngBounds() {
    List<LatLng> points = [];
    if (_currentClientLocation != null) {
      points.add(LatLng(_currentClientLocation!.latitude!, _currentClientLocation!.longitude!));
    }
    for (final latLng in _riderLocations.values) {
      points.add(latLng);
    }

    if (points.isEmpty) {
      return LatLngBounds(
        southwest: const LatLng(-85, -180),
        northeast: const LatLng(85, 180),
      );
    }

    double minLat = points.first.latitude;
    double minLng = points.first.longitude;
    double maxLat = points.first.latitude;
    double maxLng = points.first.longitude;

    for (var point in points) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }
    return LatLngBounds(southwest: LatLng(minLat, minLng), northeast: LatLng(maxLat, maxLng));
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Track Delivery'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _activeDeliveries.isEmpty
                  ? const Center(child: Text('No active deliveries to track.'))
                  : Column(
                      children: [
                        Expanded(
                          child: GoogleMap(
                            initialCameraPosition: const CameraPosition(
                              target: LatLng(-1.286389, 36.817223), // Default to Nairobi if no location yet
                              zoom: 12,
                            ),
                            onMapCreated: (controller) {
                              _mapController = controller;
                              _updateMarkers(); // Initial marker update
                            },
                            markers: _markers,
                            zoomControlsEnabled: true,
                            myLocationButtonEnabled: false,
                            myLocationEnabled: false,
                          ),
                        ),
                        // Display details of active deliveries below the map
                        SizedBox(
                          height: 200, // Adjust height as needed
                          child: ListView.builder(
                            itemCount: _activeDeliveries.length,
                            itemBuilder: (context, index) {
                              final delivery = _activeDeliveries[index];
                              return Card(
                                margin: const EdgeInsets.all(8.0),
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Delivery ID: ${delivery.id.substring(0, 8)}...'),
                                      Text('Status: ${delivery.status}'),
                                      Text('From: ${delivery.clientLocation}'),
                                      Text('To: ${delivery.destination}'),
                                      if (_riderLocations.containsKey(delivery.id))
                                        Text('Rider Location: ${_riderLocations[delivery.id]!.latitude.toStringAsFixed(4)}, ${_riderLocations[delivery.id]!.longitude.toStringAsFixed(4)}'),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
    );
  }
}
