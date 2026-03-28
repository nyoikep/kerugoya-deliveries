import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'dart:convert';

class AuthService {
  // A helper to create a fake JWT-like token for dev mode
  String _createMockToken(String role, String email) {
    final header = base64Url.encode(utf8.encode(json.encode({"alg": "HS256", "typ": "JWT"})));
    final payload = base64Url.encode(utf8.encode(json.encode({
      "userId": "mock-user-id",
      "role": role,
      "email": email,
      "exp": DateTime.now().add(const Duration(days: 1)).millisecondsSinceEpoch ~/ 1000
    })));
    return "$header.$payload.mocksignature";
  }

  Future<String> login(String email, String password) async {
    try {
      final response = await ApiService.post('auth/login', {
        'email': email,
        'password': password,
      });
      if (response.containsKey('token')) {
        return response['token'];
      }
      throw HttpException(message: 'Login failed: Invalid response', statusCode: 500);
    } catch (e) {
      print('AuthService Login Error: $e');
      // ONLY allow mock login for specific test accounts to keep it safe
      if (email == 'admin@test.com' && password == 'admin123') return _createMockToken('ADMIN', email);
      if (email == 'rider@test.com' && password == 'rider123') return _createMockToken('RIDER', email);
      if (email == 'client@test.com' && password == 'client123') return _createMockToken('CLIENT', email);
      
      // If not a test account, rethrow the error so user knows it failed
      if (e is HttpException) rethrow;
      throw HttpException(message: 'Connection error. Please try again later.', statusCode: 500);
    }
  }

  Future<String> register(String name, String email, String phone, String password, String role) async {
    try {
      final response = await ApiService.post('auth/register', {
        'name': name,
        'email': email,
        'phone': phone,
        'password': password,
        'role': role,
      });
      if (response.containsKey('token')) {
        return response['token'];
      }
      throw HttpException(message: 'Registration failed', statusCode: 500);
    } catch (e) {
      print('AuthService Register Error: $e');
      if (e is HttpException) rethrow;
      throw HttpException(message: 'Failed to register. Please check your connection.', statusCode: 500);
    }
  }

  Future<String> registerRider(String name, String email, String phone, String idNumber, String motorcyclePlateNumber, String password, {String? idCardUrl}) async {
    try {
      final response = await ApiService.post('auth/register', {
        'name': name,
        'email': email,
        'phone': phone,
        'idNumber': idNumber,
        'motorcyclePlateNumber': motorcyclePlateNumber,
        'password': password,
        'idCardUrl': idCardUrl,
        'role': 'RIDER',
      });
      if (response.containsKey('token')) {
        return response['token'];
      }
      throw HttpException(message: 'Rider registration failed', statusCode: 500);
    } catch (e) {
      print('AuthService Rider Register Error: $e');
      if (e is HttpException) rethrow;
      throw HttpException(message: 'Failed to register rider.', statusCode: 500);
    }
  }
}
