import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:kerugoya_deliveries_mobile/models/cart_item.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/services/rider_service.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:provider/provider.dart';
import 'package:location/location.dart';
import 'package:intl/intl.dart';
import 'dart:math' show cos, sqrt, asin;

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
  
  bool _isScheduled = false;
  DateTime? _scheduledAt;
  bool _isExpress = false;
  double _tipAmount = 0;

  // Pricing constants (Mirroring Backend)
  static const double baseFare = 150.0;
  static const double expressFee = 100.0;
  static const double platformFeePercent = 0.10;

  double _calculateDistance(LatLng p1, LatLng p2) {
    var p = 0.017453292519943295;
    var c = cos;
    var a = 0.5 - c((p2.latitude - p1.latitude) * p) / 2 +
        c(p1.latitude * p) * c(p2.latitude * p) *
            (1 - c((p2.longitude - p1.longitude) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }

  double get _surgeMultiplier {
    final hour = DateTime.now().hour;
    return (hour >= 17 && hour <= 20) ? 1.5 : 1.0;
  }

  double get _calculatedPrice {
    if (_pickupLocation == null || _destinationLocation == null) return 0.0;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final cart = Provider.of<CartProvider>(context, listen: false);
    final user = authProvider.user;
    
    double tripBase = baseFare + (cart.items.length * 20.0);
    double surgePrice = tripBase * _surgeMultiplier;
    double platformFee = (user?.isGold ?? false) ? 0 : (tripBase * platformFeePercent);
    double expressPrice = _isExpress ? expressFee : 0;
    
    return surgePrice + platformFee + expressPrice + _tipAmount;
  }

  @override
  void initState() {
    super.initState();
    _getUserLocation();
    Provider.of<SocketService>(context, listen: false).connectSocket();
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
      if (_isScheduled && _scheduledAt == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a schedule time.')),
        );
        return;
      }
      _finaliseOrder();
    }
  }

  Future<void> _finaliseOrder() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (!authProvider.isAuthenticated) {
      await Navigator.of(context).push(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      if (!authProvider.isAuthenticated) return;
    }

    setState(() { _isSubmitting = true; });

    try {
      final cart = Provider.of<CartProvider>(context, listen: false);
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      final socketService = Provider.of<SocketService>(context, listen: false);

      await deliveryService.createDeliveryRequest(
        cartItems: cart.items.values.toList(),
        clientLocation: '${_pickupLocation!.latitude},${_pickupLocation!.longitude}',
        destination: '${_destinationLocation!.latitude},${_destinationLocation!.longitude}',
        riderId: _selectedRiderId,
        socketService: socketService,
        scheduledAt: _isScheduled ? _scheduledAt?.toIso8601String() : null,
        isExpress: _isExpress,
        tipAmount: _tipAmount,
      );

      if (mounted) {
        cart.clearCart();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Trip booked successfully! Riders notified.')),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      setState(() { _isSubmitting = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to book trip: $e')),
        );
      }
    }
  }

  Future<void> _selectDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );
      if (time != null) {
        setState(() {
          _scheduledAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        title: Text(_getStepTitle(), style: const TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          if (_currentStep == CheckoutStep.selectRider)
            Padding(
              padding: const EdgeInsets.only(right: 10),
              child: ChoiceChip(
                label: Text(_isScheduled ? 'SCHEDULED' : 'NOW'),
                selected: _isScheduled,
                onSelected: (val) => setState(() => _isScheduled = val),
                selectedColor: Colors.blue[600],
                labelStyle: TextStyle(color: _isScheduled ? Colors.white : Colors.black, fontWeight: FontWeight.bold),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _currentStep == CheckoutStep.selectRider
                ? _buildRiderSelection()
                : _buildMapSelection(),
          ),
          _buildBottomPanel(),
        ],
      ),
    );
  }

  Widget _buildBottomPanel() {
    final cart = Provider.of<CartProvider>(context);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;
    final totalPrice = cart.totalAmount + _calculatedPrice;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, -5))],
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_pickupLocation != null && _destinationLocation != null)
            Column(
              children: [
                // Monetization Options Row
                if (_currentStep == CheckoutStep.selectRider)
                Padding(
                  padding: const EdgeInsets.only(bottom: 15),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _isExpress = !_isExpress),
                          child: Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: _isExpress ? Colors.blue[50] : Colors.grey[50],
                              borderRadius: BorderRadius.circular(15),
                              border: Border.all(color: _isExpress ? Colors.blue[200]! : Colors.grey[200]!),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.bolt, size: 16, color: _isExpress ? Colors.blue[700] : Colors.grey[600]),
                                    const SizedBox(width: 4),
                                    Text('Express', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: _isExpress ? Colors.blue[700] : Colors.grey[600])),
                                  ],
                                ),
                                const Text('+ Ksh 100', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10)),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.green[50],
                            borderRadius: BorderRadius.circular(15),
                            border: Border.all(color: Colors.green[100]!),
                          ),
                          child: Column(
                            children: [
                              const Text('Tip Rider', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.green)),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                children: [20, 50, 100].map((amt) => InkWell(
                                  onTap: () => setState(() => _tipAmount = _tipAmount == amt.toDouble() ? 0 : amt.toDouble()),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: _tipAmount == amt.toDouble() ? Colors.green : Colors.white,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text('K$amt', style: TextStyle(color: _tipAmount == amt.toDouble() ? Colors.white : Colors.green, fontSize: 10, fontWeight: FontWeight.w900)),
                                  ),
                                )).toList(),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                Container(
                  margin: const EdgeInsets.only(bottom: 15),
                  padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black87,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Base + Surge', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          Text('Ksh ${(baseFare + cart.items.length * 20.0) * _surgeMultiplier}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            (user?.isGold ?? false) ? 'Platform Fee (GOLD)' : 'Platform Fee', 
                            style: TextStyle(color: (user?.isGold ?? false) ? Colors.yellow : Colors.white70, fontSize: 12)
                          ),
                          Text(
                            (user?.isGold ?? false) ? 'FREE' : 'Ksh ${(baseFare + cart.items.length * 20.0) * platformFeePercent}', 
                            style: TextStyle(color: (user?.isGold ?? false) ? Colors.yellow : Colors.white, fontWeight: FontWeight.bold)
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          if (_currentStep == CheckoutStep.selectRider && _isScheduled)
            InkWell(
              onTap: _selectDateTime,
              child: Container(
                margin: const EdgeInsets.only(bottom: 15),
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(15)),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month, color: Colors.blue),
                    const SizedBox(width: 15),
                    Text(
                      _scheduledAt == null ? 'Select Date & Time' : DateFormat('EEE, MMM d, h:mm a').format(_scheduledAt!),
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                    ),
                    const Spacer(),
                    const Icon(Icons.edit, size: 16, color: Colors.blue),
                  ],
                ),
              ),
            ),
          Row(
            children: [
              if (_currentStep != CheckoutStep.pickup)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 10),
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                        side: const BorderSide(color: Colors.black, width: 2),
                      ),
                      onPressed: () {
                        setState(() {
                          if (_currentStep == CheckoutStep.selectRider) {
                            _currentStep = CheckoutStep.destination;
                          } else {
                            _currentStep = CheckoutStep.pickup;
                          }
                        });
                      },
                      child: const Text('BACK', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900)),
                    ),
                  ),
                ),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    elevation: 5,
                  ),
                  onPressed: _isSubmitting ? null : _handleNext,
                  child: _isSubmitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(
                          _currentStep == CheckoutStep.selectRider 
                            ? (_isScheduled ? 'SCHEDULE Ksh ${totalPrice.toStringAsFixed(0)}' : 'BOOK Ksh ${totalPrice.toStringAsFixed(0)}') 
                            : 'CONTINUE',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getStepTitle() {
    switch (_currentStep) {
      case CheckoutStep.pickup: return 'Set Pickup';
      case CheckoutStep.destination: return 'Set Destination';
      case CheckoutStep.selectRider: return 'Confirm Trip';
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
              ),
            if (_destinationLocation != null)
              Marker(
                markerId: const MarkerId('destination'),
                position: _destinationLocation!,
                icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
              ),
          },
          myLocationEnabled: true,
          myLocationButtonEnabled: true,
        ),
        Positioned(
          top: 20,
          left: 20,
          right: 20,
          child: Container(
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
            ),
            child: Row(
              children: [
                Icon(
                  _currentStep == CheckoutStep.pickup ? Icons.radio_button_checked : Icons.location_on,
                  color: _currentStep == CheckoutStep.pickup ? Colors.green : Colors.orange,
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Text(
                    _currentStep == CheckoutStep.pickup
                        ? 'Select your pickup point'
                        : 'Where are you going?',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRiderSelection() {
    if (_isLoadingRiders) return const Center(child: CircularProgressIndicator(color: Colors.black));
    if (_availableRiders.isEmpty) return const Center(child: Text('No active riders found nearby.', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)));

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _availableRiders.length,
      itemBuilder: (context, index) {
        final rider = _availableRiders[index];
        final isSelected = _selectedRiderId == rider.id;
        return InkWell(
          onTap: () => setState(() => _selectedRiderId = rider.id),
          child: Container(
            margin: const EdgeInsets.only(bottom: 15),
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: isSelected ? Colors.black : Colors.grey[100],
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isSelected ? Colors.black : Colors.grey[300]!),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: isSelected ? Colors.white24 : Colors.white, borderRadius: BorderRadius.circular(12)),
                  child: Icon(Icons.directions_bike, color: isSelected ? Colors.white : Colors.black),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(rider.name, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: isSelected ? Colors.white : Colors.black)),
                      Text(rider.motorcyclePlateNumber, style: TextStyle(color: isSelected ? Colors.white70 : Colors.grey[600], fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                if (isSelected) const Icon(Icons.check_circle, color: Colors.blue),
              ],
            ),
          ),
        );
      },
    );
  }
}
