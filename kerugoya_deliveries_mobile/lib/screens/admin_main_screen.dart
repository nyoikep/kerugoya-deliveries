import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:kerugoya_deliveries_mobile/services/rider_service.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class AdminMainScreen extends StatefulWidget {
  const AdminMainScreen({super.key});

  @override
  State<AdminMainScreen> createState() => _AdminMainScreenState();
}

class _AdminMainScreenState extends State<AdminMainScreen> {
  GoogleMapController? _mapController;
  final Map<String, Marker> _markers = {};
  List<Rider> _allRiders = [];
  List<DeliveryRequest> _activeDeliveries = [];
  bool _isLoadingData = true;

  @override
  void initState() {
    super.initState();
    _setupSocket();
    _loadInitialData();
  }

  void _setupSocket() {
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.connectSocket();
    socketService.socket?.on('connect', (_) {
      socketService.socket?.emit('joinAdminRoom');
    });
    socketService.socket?.on('admin_location_update', (data) {
      _updateMarker(data);
    });
    // Also listen for new delivery pings to refresh list
    socketService.socket?.on('rider_ping', (_) => _loadInitialData());
  }

  Future<void> _loadInitialData() async {
    try {
      final riderService = Provider.of<RiderService>(context, listen: false);
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      
      final riders = await riderService.getAvailableRiders();
      // For mock purposes, let's assume available deliveries are "active" for admin
      final deliveries = await deliveryService.getAvailableDeliveryRequests();
      
      if (mounted) {
        setState(() {
          _allRiders = riders;
          _activeDeliveries = deliveries;
          _isLoadingData = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _isLoadingData = false; });
    }
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
      infoWindow: InfoWindow(title: '$type - Request $deliveryId'),
    );

    if (mounted) {
      setState(() {
        _markers[markerId.value] = marker;
      });
    }
  }

  @override
  void dispose() {
    final socketService = Provider.of<SocketService>(context, listen: false);
    socketService.socket?.off('admin_location_update');
    socketService.socket?.off('rider_ping');
    super.dispose();
  }

  Widget _buildMap() {
    try {
      return GoogleMap(
        initialCameraPosition: const CameraPosition(target: LatLng(-0.505, 37.285), zoom: 13),
        onMapCreated: (c) => _mapController = c,
        markers: _markers.values.toSet(),
      );
    } catch (e) {
      return const Center(child: Text('Map could not be loaded. Please ensure Play Services are available.'));
    }
  }

  @override
  Widget build(BuildContext context) {
    // If the data is still loading, show a loader
    if (_isLoadingData) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    
    if (auth.userRole != 'ADMIN') {
      return const Scaffold(body: Center(child: Text('Unauthorized access.')));
    }
    
    return Scaffold(
...
            children: [
              _buildStatsBar(),
              Expanded(
                flex: 3,
                child: _buildMap(),
              ),
              Expanded(
...

  Widget _buildStatsBar() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Riders', _allRiders.length.toString(), Colors.blue),
          _buildStatItem('Requests', _activeDeliveries.length.toString(), Colors.orange),
          _buildStatItem('Live', _markers.length.toString(), Colors.green),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      ],
    );
  }

  Widget _buildInfoTabs() {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            tabs: [Tab(text: 'Active Requests'), Tab(text: 'All Riders')],
            labelColor: Colors.black,
            indicatorColor: Colors.orange,
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildRequestsList(),
                _buildRidersList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestsList() {
    if (_activeDeliveries.isEmpty) return const Center(child: Text('No active requests.'));
    return ListView.builder(
      itemCount: _activeDeliveries.length,
      itemBuilder: (context, index) {
        final d = _activeDeliveries[index];
        return ListTile(
          leading: const Icon(Icons.local_shipping, color: Colors.orange),
          title: Text('From: ${d.clientLocation}'),
          subtitle: Text('To: ${d.destination} • Status: ${d.status}'),
          trailing: const Text('LIVE', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10)),
        );
      },
    );
  }

  Widget _buildRidersList() {
    if (_allRiders.isEmpty) return const Center(child: Text('No riders registered.'));
    return ListView.builder(
      itemCount: _allRiders.length,
      itemBuilder: (context, index) {
        final r = _allRiders[index];
        return ListTile(
          leading: const CircleAvatar(child: Icon(Icons.person)),
          title: Text(r.name),
          subtitle: Text('Plate: ${r.motorcyclePlateNumber}'),
          trailing: Container(
            width: 10, height: 10,
            decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
          ),
        );
      },
    );
  }
}
