import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/foundation.dart';

class SocketService with ChangeNotifier {
  io.Socket? _socket;
  // Get base URL from environment, strip '/api' if present for socket connection
  static const String _serverBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  final String _serverUrl = _serverBaseUrl.endsWith('/api') ? _serverBaseUrl.substring(0, _serverBaseUrl.length - 4) : _serverBaseUrl;
  
  String? _currentDeliveryId;

  // Expose socket via a public getter
  io.Socket? get socket => _socket;

  // For storing other users' locations
  final Map<String, Map<String, double>> _otherUsersLocations = {};
  Map<String, Map<String, double>> get otherUsersLocations => _otherUsersLocations;

  SocketService() {
    _initSocket();
  }

  void _initSocket() {
    _socket = io.io(_serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false, // Control connection manually
    });

    _socket?.onConnect((_) {
      debugPrint('--- SOCKET CONNECTED ---');
      debugPrint('ID: ${_socket?.id}');
      if (_currentDeliveryId != null) {
        joinDeliveryRoom(_currentDeliveryId!);
      }
      notifyListeners();
    });

    _socket?.onDisconnect((_) {
      debugPrint('--- SOCKET DISCONNECTED ---');
      notifyListeners();
    });

    _socket?.on('rider_ping', (data) {
      debugPrint('--- RIDER PING RECEIVED ---');
      debugPrint('Data: $data');
    });

    _socket?.on('client_location_broadcast', (data) {
      // Assuming data = { deliveryId, latitude, longitude }
      final deliveryId = data['deliveryId'];
      if (deliveryId != null && data != null && data['latitude'] != null && data['longitude'] != null) {
        _otherUsersLocations[deliveryId] = {'latitude': data['latitude'], 'longitude': data['longitude']};
        notifyListeners();
      }
    });

    _socket?.on('rider_location_broadcast', (data) {
      // Assuming data = { deliveryId, latitude, longitude }
      final deliveryId = data['deliveryId'];
      if (deliveryId != null && data != null && data['latitude'] != null && data['longitude'] != null) {
        _otherUsersLocations[deliveryId] = {'latitude': data['latitude'], 'longitude': data['longitude']};
        notifyListeners();
      }
    });

    _socket?.on('message', (data) => debugPrint('Message from server: $data'));
    _socket?.onError((error) => debugPrint('Socket Error: $error'));
  }

  void connectSocket() { // Renamed from connect()
    _socket?.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _currentDeliveryId = null;
    _otherUsersLocations.clear();
    notifyListeners();
  }

  void reset() {
    disconnect();
    _socket?.off('client_location_broadcast');
    _socket?.off('rider_location_broadcast');
    _socket?.off('admin_location_update');
    _socket?.off('rider_ping');
  }

  void joinDeliveryRoom(String deliveryId) {
    _currentDeliveryId = deliveryId;
    _socket?.emit('joinDeliveryRoom', deliveryId);
    debugPrint('Emitting joinDeliveryRoom: $deliveryId');
  }

  void leaveDeliveryRoom(String deliveryId) {
    _socket?.emit('leaveDeliveryRoom', deliveryId); // Assuming a leave event on backend
    _currentDeliveryId = null;
    debugPrint('Emitting leaveDeliveryRoom: $deliveryId');
    _otherUsersLocations.remove(deliveryId);
    notifyListeners();
  }

  void emitClientLocationUpdate(String deliveryId, double latitude, double longitude) {
    _socket?.emit('client_location_update', {'deliveryId': deliveryId, 'latitude': latitude, 'longitude': longitude});
  }

  void emitRiderLocationUpdate(String deliveryId, double latitude, double longitude) {
    _socket?.emit('rider_location_update', {'deliveryId': deliveryId, 'latitude': latitude, 'longitude': longitude});
  }
}
