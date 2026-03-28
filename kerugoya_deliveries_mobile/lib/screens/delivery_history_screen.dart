import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/delivery_service.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart';

class DeliveryHistoryScreen extends StatefulWidget {
  const DeliveryHistoryScreen({super.key});

  @override
  State<DeliveryHistoryScreen> createState() => _DeliveryHistoryScreenState();
}

class _DeliveryHistoryScreenState extends State<DeliveryHistoryScreen> {
  List<DeliveryRequest> _history = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final deliveryService = Provider.of<DeliveryService>(context, listen: false);
      final history = await deliveryService.getClientDeliveryRequests();
      setState(() {
        _history = history;
        _isLoading = false;
      });
    } on HttpException catch (e) {
      setState(() { _error = e.message; _isLoading = false; });
    } catch (e) {
      setState(() { _error = 'Failed to load history'; _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Orders History', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _fetchHistory,
            child: _history.isEmpty 
              ? const Center(child: Text('No orders found.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _history.length,
                  itemBuilder: (context, index) {
                    final d = _history[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const CircleAvatar(backgroundColor: Colors.orange, child: Icon(Icons.shopping_bag, color: Colors.white)),
                        title: Text('Order ${d.id.substring(0, 8)}'),
                        subtitle: Text('${d.clientLocation} to ${d.destination}\nStatus: ${d.status}'),
                        isThreeLine: true,
                        trailing: const Icon(Icons.chevron_right),
                      ),
                    );
                  },
                ),
          ),
    );
  }
}
