import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // When sharing the APK, replace this with your public Backend URL (e.g. Render or Ngrok)
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://kerugoya-deliveries-production.up.railway.app/api', // Updated for Railway!
  );

  static String get rootUrl {
    if (_baseUrl.endsWith('/api')) {
      return _baseUrl.substring(0, _baseUrl.length - 4);
    } else if (_baseUrl.endsWith('/api/')) {
      return _baseUrl.substring(0, _baseUrl.length - 5);
    }
    return _baseUrl;
  }

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

  static dynamic _handleResponse(http.Response response) {
    try {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return json.decode(response.body);
      } else {
        dynamic errorData;
        try {
          errorData = json.decode(response.body);
        } catch (e) {
          errorData = {'message': 'Server returned status code ${response.statusCode}'};
        }
        throw HttpException(
          message: errorData['message'] ?? 'Something went wrong',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is HttpException) rethrow;
      throw HttpException(
        message: 'Failed to process response: ${e.toString()}',
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
