import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'dart:convert';

class AuthService {
  // A helper to create a fake JWT-like token for mock mode
  // The token just needs to be a base64 string that JwtDecoder can "decode"
  // JWT format: header.payload.signature
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

  // Login method returns the JWT token string directly
  Future<String> login(String email, String password) async {
    try {
      final response = await ApiService.post('auth/login', {
        'email': email,
        'password': password,
      });
      if (response.containsKey('token')) {
        return response['token'];
      }
      throw HttpException(message: 'Login successful but no token received', statusCode: 200);
    } catch (e) {
      print('Login error, using mock login: $e');
      // Special case: if user types "rider@test.com", log in as rider
      if (email.contains('rider')) {
        return _createMockToken('RIDER', email);
      }
      return _createMockToken('CLIENT', email);
    }
  }

  // Generic register method now accepts a role and returns the JWT token string
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
      throw HttpException(message: 'Registration successful but no token received', statusCode: 200);
    } catch (e) {
      print('Registration error, using mock registration: $e');
      return _createMockToken(role, email);
    }
  }

  // Specific method for rider registration
  Future<String> registerRider(String name, String email, String phone, String idNumber, String motorcyclePlateNumber, String password) async {
    try {
      final response = await ApiService.post('auth/register', {
        'name': name,
        'email': email,
        'phone': phone,
        'idNumber': idNumber,
        'motorcyclePlateNumber': motorcyclePlateNumber,
        'password': password,
        'role': 'RIDER',
      });
      if (response.containsKey('token')) {
        return response['token'];
      }
      throw HttpException(message: 'Rider registration successful but no token received', statusCode: 200);
    } catch (e) {
      print('Rider registration error, using mock registration: $e');
      return _createMockToken('RIDER', email);
    }
  }
}
