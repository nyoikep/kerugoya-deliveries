import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/foundation.dart';

class SocketService with ChangeNotifier {
  io.Socket? _socket;
  static const String _serverBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  final String _serverUrl = _serverBaseUrl.endsWith('/api') ? _serverBaseUrl.substring(0, _serverBaseUrl.length - 4) : _serverBaseUrl;
  
  String? _currentDeliveryId;
  bool _isDisposed = false;

  io.Socket? get socket => _socket;

  final Map<String, Map<String, double>> _otherUsersLocations = {};
  Map<String, Map<String, double>> get otherUsersLocations => _otherUsersLocations;

  SocketService() {
    _initSocket();
  }

  @override
  void dispose() {
    _isDisposed = true;
    _socket?.dispose();
    super.dispose();
  }

  void _safeNotifyListeners() {
    if (!_isDisposed) {
      notifyListeners();
    }
  }

  void _initSocket() {
    _socket = io.io(_serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket?.onConnect((_) {
      debugPrint('--- SOCKET CONNECTED ---');
      if (_currentDeliveryId != null) {
        joinDeliveryRoom(_currentDeliveryId!);
      }
      _safeNotifyListeners();
    });

    _socket?.onDisconnect((_) {
      debugPrint('--- SOCKET DISCONNECTED ---');
      _safeNotifyListeners();
    });

    _socket?.on('rider_ping', (data) {
      debugPrint('--- RIDER PING RECEIVED ---');
    });

    _socket?.on('client_location_broadcast', (data) {
      final deliveryId = data['deliveryId'];
      if (deliveryId != null && data['latitude'] != null && data['longitude'] != null) {
        _otherUsersLocations[deliveryId] = {'latitude': data['latitude'], 'longitude': data['longitude']};
        _safeNotifyListeners();
      }
    });

    _socket?.on('rider_location_broadcast', (data) {
      final deliveryId = data['deliveryId'];
      if (deliveryId != null && data['latitude'] != null && data['longitude'] != null) {
        _otherUsersLocations[deliveryId] = {'latitude': data['latitude'], 'longitude': data['longitude']};
        _safeNotifyListeners();
      }
    });

    _socket?.on('message', (data) => debugPrint('Message from server: $data'));
    _socket?.onError((error) => debugPrint('Socket Error: $error'));
  }

  void connectSocket() {
    _socket?.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _currentDeliveryId = null;
    _otherUsersLocations.clear();
    _safeNotifyListeners();
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
  }

  void leaveDeliveryRoom(String deliveryId) {
    _socket?.emit('leaveDeliveryRoom', deliveryId);
    _currentDeliveryId = null;
    _otherUsersLocations.remove(deliveryId);
    _safeNotifyListeners();
  }

  void emitClientLocationUpdate(String deliveryId, double latitude, double longitude) {
    _socket?.emit('client_location_update', {'deliveryId': deliveryId, 'latitude': latitude, 'longitude': longitude});
  }

  void emitRiderLocationUpdate(String deliveryId, double latitude, double longitude) {
    _socket?.emit('rider_location_update', {'deliveryId': deliveryId, 'latitude': latitude, 'longitude': longitude});
  }
}
