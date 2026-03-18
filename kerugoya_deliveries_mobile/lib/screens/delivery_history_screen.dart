import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:intl/intl.dart'; // For date formatting

class DeliveryHistoryScreen extends StatefulWidget {
  const DeliveryHistoryScreen({super.key});

  @override
  State<DeliveryHistoryScreen> createState() => _DeliveryHistoryScreenState();
}

class _DeliveryHistoryScreenState extends State<DeliveryHistoryScreen> {
  List<DeliveryRequest> _pastDeliveries = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchPastDeliveries();
  }

  Future<void> _fetchPastDeliveries() async {
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      final deliveries = await deliveryService.getClientDeliveryRequests();
      setState(() {
        _pastDeliveries = deliveries.where((d) => d.status == 'DELIVERED' || d.status == 'CANCELLED').toList();
        _isLoading = false;
      });
    } on HttpException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load delivery history: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery History'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _pastDeliveries.isEmpty
                  ? const Center(child: Text('No past deliveries found.'))
                  : ListView.builder(
                      itemCount: _pastDeliveries.length,
                      itemBuilder: (context, index) {
                        final delivery = _pastDeliveries[index];
                        return Card(
                          margin: const EdgeInsets.all(8.0),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Order ID: ${delivery.id.substring(0, 8)}...',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 5),
                                Text('Status: ${delivery.status}'),
                                Text('From: ${delivery.clientLocation}'),
                                Text('To: ${delivery.destination}'),
                                Text('Date: ${DateFormat.yMd().add_jm().format(delivery.createdAt)}'),
                                const SizedBox(height: 10),
                                // Display cart items
                                const Text('Items:', style: TextStyle(fontWeight: FontWeight.w600)),
                                ...delivery.cartItems.map((item) => Text('- ${item.product.name} x ${item.quantity}')),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
