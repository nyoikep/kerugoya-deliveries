import 'package:kerugoya_deliveries_mobile/services/api_service.dart';

class AuthService {
  // Login method returns the JWT token string directly
  Future<String> login(String email, String password) async {
    try {
      final response = await ApiService.post('auth/login', {
        'email': email,
        'password': password,
      });
      if (response.containsKey('token')) {
        return response['token']; // Assuming the backend returns a 'token' field
      }
      throw HttpException(message: 'Login successful but no token received', statusCode: 200);
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Login failed: ${e.toString()}', statusCode: 500);
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
        return response['token']; // Assuming the backend returns a 'token' field
      }
      throw HttpException(message: 'Registration successful but no token received', statusCode: 200);
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Registration failed: ${e.toString()}', statusCode: 500);
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
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Rider registration failed: ${e.toString()}', statusCode: 500);
    }
  }
}
