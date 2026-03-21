import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:kerugoya_deliveries_mobile/models/cart_item.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/services/rider_service.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:provider/provider.dart';
import 'package:location/location.dart';

enum CheckoutStep { pickup, destination, selectRider }

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  CheckoutStep _currentStep = CheckoutStep.pickup;
  LatLng? _pickupLocation;
  LatLng? _destinationLocation;
  List<Rider> _availableRiders = [];
  String? _selectedRiderId;
  bool _isLoadingRiders = false;
  bool _isSubmitting = false;
  GoogleMapController? _mapController;
  final Location _location = Location();
  LatLng _initialPosition = const LatLng(-0.505, 37.285); // Kerugoya area

  @override
  void initState() {
    super.initState();
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    bool serviceEnabled;
    PermissionStatus permissionGranted;

    serviceEnabled = await _location.serviceEnabled();
    if (!serviceEnabled) {
      serviceEnabled = await _location.requestService();
      if (!serviceEnabled) return;
    }

    permissionGranted = await _location.hasPermission();
    if (permissionGranted == PermissionStatus.denied) {
      permissionGranted = await _location.requestPermission();
      if (permissionGranted != PermissionStatus.granted) return;
    }

    final locationData = await _location.getLocation();
    if (mounted) {
      setState(() {
        _initialPosition = LatLng(locationData.latitude!, locationData.longitude!);
      });
      _mapController?.animateCamera(CameraUpdate.newLatLng(_initialPosition));
    }
  }

  Future<void> _fetchRiders() async {
    setState(() { _isLoadingRiders = true; });
    try {
      final riderService = Provider.of<RiderService>(context, listen: false);
      final riders = await riderService.getAvailableRiders();
      setState(() {
        _availableRiders = riders;
        _isLoadingRiders = false;
      });
    } catch (e) {
      setState(() { _isLoadingRiders = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load riders: $e')),
        );
      }
    }
  }

  void _onMapTap(LatLng position) {
    setState(() {
      if (_currentStep == CheckoutStep.pickup) {
        _pickupLocation = position;
      } else if (_currentStep == CheckoutStep.destination) {
        _destinationLocation = position;
      }
    });
  }

  Future<void> _handleNext() async {
    if (_currentStep == CheckoutStep.pickup) {
      if (_pickupLocation == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a pickup location.')),
        );
        return;
      }
      setState(() { _currentStep = CheckoutStep.destination; });
    } else if (_currentStep == CheckoutStep.destination) {
      if (_destinationLocation == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a destination location.')),
        );
        return;
      }
      _fetchRiders();
      setState(() { _currentStep = CheckoutStep.selectRider; });
    } else if (_currentStep == CheckoutStep.selectRider) {
      if (_selectedRiderId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a rider.')),
        );
        return;
      }
      _finaliseOrder();
    }
  }

  Future<void> _finaliseOrder() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      final result = await Navigator.of(context).push(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      // If result is null, user just popped back without logging in
      if (!authProvider.isAuthenticated) return;
    }

    setState(() { _isSubmitting = true; });

    try {
      final cart = Provider.of<CartProvider>(context, listen: false);
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);

      await deliveryService.createDeliveryRequest(
        cartItems: cart.items.values.toList(),
        clientLocation: '${_pickupLocation!.latitude},${_pickupLocation!.longitude}',
        destination: '${_destinationLocation!.latitude},${_destinationLocation!.longitude}',
        riderId: _selectedRiderId,
      );

      if (mounted) {
        cart.clearCart();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Delivery request created successfully!')),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      setState(() { _isSubmitting = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create delivery: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getStepTitle()),
      ),
      body: Column(
        children: [
          Expanded(
            child: _currentStep == CheckoutStep.selectRider
                ? _buildRiderSelection()
                : _buildMapSelection(),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_currentStep != CheckoutStep.pickup)
                  TextButton(
                    onPressed: () {
                      setState(() {
                        if (_currentStep == CheckoutStep.selectRider) {
                          _currentStep = CheckoutStep.destination;
                        } else {
                          _currentStep = CheckoutStep.pickup;
                        }
                      });
                    },
                    child: const Text('BACK'),
                  )
                else
                  const SizedBox(),
                ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleNext,
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : Text(_currentStep == CheckoutStep.selectRider ? 'FINISH' : 'NEXT'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case CheckoutStep.pickup: return 'Select Pickup';
      case CheckoutStep.destination: return 'Select Destination';
      case CheckoutStep.selectRider: return 'Select Rider';
    }
  }

  Widget _buildMapSelection() {
    return Stack(
      children: [
        GoogleMap(
          initialCameraPosition: CameraPosition(target: _initialPosition, zoom: 15),
          onMapCreated: (c) => _mapController = c,
          onTap: _onMapTap,
          markers: {
            if (_pickupLocation != null)
              Marker(
                markerId: const MarkerId('pickup'),
                position: _pickupLocation!,
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
                infoWindow: const InfoWindow(title: 'Pickup Location'),
              ),
            if (_destinationLocation != null)
              Marker(
                markerId: const MarkerId('destination'),
                position: _destinationLocation!,
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
                infoWindow: const InfoWindow(title: 'Destination Location'),
              ),
          },
          myLocationEnabled: true,
          myLocationButtonEnabled: true,
        ),
        Positioned(
          top: 10,
          left: 10,
          right: 10,
          child: Container(
            padding: const EdgeInsets.all(8),
            color: Colors.white.withOpacity(0.8),
            child: Text(
              _currentStep == CheckoutStep.pickup
                  ? 'Tap on map to set PICKUP location'
                  : 'Tap on map to set DESTINATION location',
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRiderSelection() {
    if (_isLoadingRiders) return const Center(child: CircularProgressIndicator());
    if (_availableRiders.isEmpty) return const Center(child: Text('No riders available.'));

    return ListView.builder(
      itemCount: _availableRiders.length,
      itemBuilder: (context, index) {
        final rider = _availableRiders[index];
        return ListTile(
          title: Text(rider.name),
          subtitle: Text('Plate: ${rider.motorcyclePlateNumber}'),
          trailing: Radio<String>(
            value: rider.id,
            groupValue: _selectedRiderId,
            onChanged: (val) => setState(() => _selectedRiderId = val),
          ),
          onTap: () => setState(() => _selectedRiderId = rider.id),
        );
      },
    );
  }
}
