import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException

class RiderHomeScreen extends StatefulWidget {
  const RiderHomeScreen({super.key});

  @override
  State<RiderHomeScreen> createState() => _RiderHomeScreenState();
}

class _RiderHomeScreenState extends State<RiderHomeScreen> {
  List<DeliveryRequest> _availableDeliveries = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchAvailableDeliveries();
  }

  Future<void> _fetchAvailableDeliveries() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      final deliveries = await deliveryService.getAvailableDeliveryRequests();
      setState(() {
        _availableDeliveries = deliveries;
        _isLoading = false;
      });
    } on HttpException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load available deliveries: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  Future<void> _handleAccept(String deliveryId) async {
    setState(() { _isLoading = true; }); // Show loading for accept action
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      await deliveryService.acceptDeliveryRequest(deliveryId);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Delivery accepted!')),
      );
      _fetchAvailableDeliveries(); // Refresh list
    } on HttpException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to accept: ${e.message}')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error accepting delivery: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() { _isLoading = false; });
      }
    }
  }

  // Placeholder for decline logic (might just remove from list, or update status on backend)
  void _handleDecline(String deliveryId) {
    setState(() {
      _availableDeliveries.removeWhere((d) => d.id == deliveryId);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Delivery declined (local update).')),
    );
    // In a real app, you might send a decline status to the backend.
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Delivery Requests'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchAvailableDeliveries,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _availableDeliveries.isEmpty
                  ? const Center(child: Text('No available delivery requests.'))
                  : ListView.builder(
                      itemCount: _availableDeliveries.length,
                      itemBuilder: (context, index) {
                        final delivery = _availableDeliveries[index];
                        return Card(
                          margin: const EdgeInsets.all(8.0),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Request ID: ${delivery.id.substring(0, 8)}...',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 5),
                                Text('From: ${delivery.clientLocation}'),
                                Text('To: ${delivery.destination}'),
                                if (delivery.description != null && delivery.description!.isNotEmpty)
                                  Text('Description: ${delivery.description}'),
                                const SizedBox(height: 10),
                                const Text('Items:', style: TextStyle(fontWeight: FontWeight.w600)),
                                ...delivery.cartItems.map((item) => Text('- ${item.product.name} x ${item.quantity}')),
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    TextButton(
                                      onPressed: () => _handleDecline(delivery.id),
                                      child: const Text('Decline', style: TextStyle(color: Colors.red)),
                                    ),
                                    const SizedBox(width: 8),
                                    ElevatedButton(
                                      onPressed: () => _handleAccept(delivery.id),
                                      child: const Text('Accept'),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
