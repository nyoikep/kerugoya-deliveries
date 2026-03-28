import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class AdminMainScreen extends StatefulWidget {
  const AdminMainScreen({super.key});

  @override
  State<AdminMainScreen> createState() => _AdminMainScreenState();
}

class _AdminMainScreenState extends State<AdminMainScreen> {
  GoogleMapController? _mapController;
  final Map<String, Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.connectSocket();
    
    // Correct way to listen for connect in socket_io_client
    socketService.socket?.on('connect', (_) {
      socketService.socket?.emit('joinAdminRoom');
    });
    
    socketService.socket?.on('admin_location_update', (data) {
      _updateMarker(data);
    });
  }

  void _updateMarker(Map<String, dynamic> data) {
    final String type = data['type'];
    final String deliveryId = data['deliveryId'];
    final double lat = data['latitude'];
    final double lng = data['longitude'];
    
    final markerId = MarkerId('${type}_$deliveryId');
    final marker = Marker(
      markerId: markerId,
      position: LatLng(lat, lng),
      icon: BitmapDescriptor.defaultMarkerWithHue(
        type == 'RIDER' ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueRed
      ),
      infoWindow: InfoWindow(title: '$type - $deliveryId'),
    );

    if (mounted) {
      setState(() {
        _markers[markerId.value] = marker;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard - Live Tracking'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatCard('Active Riders', '5', Colors.blue),
                _buildStatCard('Active Deliveries', _markers.length.toString(), Colors.green),
              ],
            ),
          ),
          Expanded(
            child: GoogleMap(
              initialCameraPosition: const CameraPosition(
                target: LatLng(-0.505, 37.285),
                zoom: 13,
              ),
              onMapCreated: (c) => _mapController = c,
              markers: _markers.values.toSet(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}
