import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // When sharing the APK, replace this with your public Backend URL (e.g. Render or Ngrok)
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api', // For local adb reverse
  );

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> data, {String? token}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    final response = await http.post(
      Uri.parse('$_baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return _handleResponse(response);
  }

  static Future<dynamic> get(String endpoint, {String? token}) async { // Changed return type to dynamic
    final headers = <String, String>{};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    final response = await http.get(
      Uri.parse('$_baseUrl/$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  static dynamic _handleResponse(http.Response response) { // Changed return type to dynamic
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      final errorData = json.decode(response.body);
      throw HttpException(
        message: errorData['message'] ?? 'Something went wrong',
        statusCode: response.statusCode,
      );
    }
  }
}

class HttpException implements Exception {
  final String message;
  final int statusCode;

  HttpException({required this.message, required this.statusCode});

  @override
  String toString() {
    return 'HttpException: Status Code $statusCode - $message';
  }
}
