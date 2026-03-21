import 'dart:async'; // For StreamSubscription

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart'; // For map display
import 'package:intl/intl.dart'; // For date formatting
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart'; // For SocketService
import 'package:location/location.dart'; // For location tracking
import 'package:provider/provider.dart';

class RiderDeliveriesScreen extends StatefulWidget {
  const RiderDeliveriesScreen({super.key});

  @override
  State<RiderDeliveriesScreen> createState() => _RiderDeliveriesScreenState();
}

class _RiderDeliveriesScreenState extends State<RiderDeliveriesScreen> {
  List<DeliveryRequest> _riderDeliveries = [];
  bool _isLoading = true;
  String? _error;
  final Location _location = Location();
  StreamSubscription<LocationData>? _locationSubscription;
  LocationData? _currentRiderLocation;
  final Map<String, LatLng> _clientLocations = {}; // Map deliveryId to client's LatLng
  late GoogleMapController _mapController;
  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _fetchRiderDeliveries();
    _initLocationTracking();
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    super.dispose();
  }

  Future<void> _fetchRiderDeliveries() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      // Assuming a method like getRiderAssignedDeliveries() is available in DeliveryService
      // For now, I'll reuse getClientDeliveryRequests but filter by riderId == current rider ID
      // This will require fetching current user ID from token
      // TODO: Implement getRiderAssignedDeliveries() in DeliveryService to fetch deliveries assigned to the current rider
      final allDeliveries = await deliveryService.getClientDeliveryRequests(); // Temporarily using this
      final riderDeliveries = allDeliveries.where((d) => d.riderId != null).toList(); // Simplified filter

      setState(() {
        _riderDeliveries = riderDeliveries;
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
        _error = 'Failed to load rider deliveries: ${e.toString()}';
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
        return;
      }
    }

    permissionGranted = await _location.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _location.requestPermission();
      if (permissionGranted != PermissionStatus.granted) {
        return;
      }
    }

    _locationSubscription = _location.onLocationChanged.listen((LocationData currentLocation) {
      setState(() {
        _currentRiderLocation = currentLocation;
        _updateMarkers();
      });
      _emitRiderLocation(currentLocation);
    });
  }

  void _setupSocketListeners() {
    final socketService = Provider.of<SocketService>(context, listen: false);
    if (socketService.socket == null || !socketService.socket!.connected) {
      socketService.connectSocket(); // Use the correct method name
    }

    if (socketService.socket!.connected) {
      for (var delivery in _riderDeliveries) {
        if (delivery.status == 'ACCEPTED' || delivery.status == 'IN_PROGRESS') {
          socketService.socket!.emit('joinDeliveryRoom', delivery.id);
        }
      }
    } else {
          socketService.socket?.on('connect', (_) { // Use .on('connect', ...)
            for (var delivery in _riderDeliveries) {
              if (delivery.status == 'ACCEPTED' || delivery.status == 'IN_PROGRESS') {
                socketService.socket?.emit('joinDeliveryRoom', delivery.id);
              }
            }
          });    }

    socketService.socket!.on('client_location_broadcast', (data) {
      final deliveryId = data['deliveryId'];
      final latitude = data['latitude'];
      final longitude = data['longitude'];
      if (deliveryId != null && latitude != null && longitude != null) {
        setState(() {
          _clientLocations[deliveryId] = LatLng(latitude, longitude);
          _updateMarkers();
        });
      }
    });
  }

  void _emitRiderLocation(LocationData locationData) {
    final socketService = Provider.of<SocketService>(context, listen: false);

    if (socketService.socket != null && socketService.socket!.connected) {
      for (var delivery in _riderDeliveries.where((d) => d.status == 'ACCEPTED' || d.status == 'IN_PROGRESS')) {
        socketService.socket!.emit('rider_location_update', {
          'deliveryId': delivery.id,
          'latitude': locationData.latitude,
          'longitude': locationData.longitude,
        });
      }
    }
  }

  void _updateMarkers() {
    _markers.clear();
    if (_currentRiderLocation != null) {
      _markers.add(Marker(
        markerId: const MarkerId('riderLocation'),
        position: LatLng(_currentRiderLocation!.latitude!, _currentRiderLocation!.longitude!),
        infoWindow: const InfoWindow(title: 'Your Location'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      ));
    }

    for (final entry in _clientLocations.entries) {
      _markers.add(Marker(
        markerId: MarkerId('client_${entry.key}'),
        position: entry.value,
        infoWindow: InfoWindow(title: 'Client for ${entry.key.substring(0, 8)}...'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      ));
    }
    // If _mapController is available, animate camera to show both client and rider
    if (_currentRiderLocation != null && _clientLocations.isNotEmpty) {
      LatLngBounds bounds = _getLatLngBounds();
      _mapController.animateCamera(CameraUpdate.newLatLngBounds(bounds, 50));
    }
    setState(() {}); // Trigger rebuild to update markers
  }

  LatLngBounds _getLatLngBounds() {
    List<LatLng> points = [];
    if (_currentRiderLocation != null) {
      points.add(LatLng(_currentRiderLocation!.latitude!, _currentRiderLocation!.longitude!));
    }
    for (final latLng in _clientLocations.values) {
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

  Future<void> _updateDeliveryStatus(String deliveryId, String newStatus) async {
    setState(() { _isLoading = true; });
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      await deliveryService.updateDeliveryStatus(deliveryId, newStatus);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Delivery $deliveryId status updated to $newStatus')),
      );
      _fetchRiderDeliveries(); // Refresh list
    } on HttpException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update status: ${e.message}')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating status: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Deliveries'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchRiderDeliveries,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _riderDeliveries.isEmpty
                  ? const Center(child: Text('No assigned deliveries.'))
                  : Column(
                      children: [
                        Expanded(
                          child: GoogleMap(
                            initialCameraPosition: const CameraPosition(
                              target: LatLng(-1.286389, 36.817223), // Default to Nairobi
                              zoom: 12,
                            ),
                            onMapCreated: (controller) {
                              _mapController = controller;
                              _updateMarkers();
                            },
                            markers: _markers,
                            zoomControlsEnabled: true,
                            myLocationButtonEnabled: false,
                            myLocationEnabled: false,
                          ),
                        ),
                        // Display details of assigned deliveries below the map
                        SizedBox(
                          height: 200, // Adjust height as needed
                          child: ListView.builder(
                            itemCount: _riderDeliveries.length,
                            itemBuilder: (context, index) {
                              final delivery = _riderDeliveries[index];
                              return Card(
                                margin: const EdgeInsets.all(8.0),
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Delivery ID: ${delivery.id.substring(0, 8)}...', style: const TextStyle(fontWeight: FontWeight.bold)),
                                      const Divider(),
                                      Text('Client: ${delivery.clientName ?? 'Unknown'}', style: const TextStyle(fontSize: 16)),
                                      GestureDetector(
                                        onTap: () {
                                          if (delivery.clientPhone != null) {
                                            // You might need url_launcher for this, but for now just showing it
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('Calling ${delivery.clientPhone}...')),
                                            );
                                          }
                                        },
                                        child: Text(
                                          'Phone: ${delivery.clientPhone ?? 'N/A'}',
                                          style: const TextStyle(color: Colors.blue, decoration: TextDecoration.underline),
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text('Status: ${delivery.status}'),
                                      Text('From: ${delivery.clientLocation}'),
                                      Text('To: ${delivery.destination}'),
                                      Text('Assigned: ${DateFormat.yMd().add_jm().format(delivery.createdAt)}'),
                                      const SizedBox(height: 10),
                                      if (delivery.status == 'ACCEPTED' || delivery.status == 'IN_PROGRESS')
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.end,
                                          children: [
                                            ElevatedButton(
                                              onPressed: () => _updateDeliveryStatus(delivery.id, 'IN_PROGRESS'),
                                              child: const Text('Picked Up / En Route'),
                                            ),
                                            const SizedBox(width: 8),
                                            ElevatedButton(
                                              onPressed: () => _updateDeliveryStatus(delivery.id, 'DELIVERED'),
                                              child: const Text('Delivered'),
                                            ),
                                          ],
                                        ),
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
