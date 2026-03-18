import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:jwt_decoder/jwt_decoder.dart'; // Need to add this to pubspec.yaml

class AuthProvider extends ChangeNotifier {
  String? _token;
  String? _userRole; // 'CLIENT' or 'RIDER'

  String? get token => _token;
  String? get userRole => _userRole;
  bool get isAuthenticated => _token != null && !JwtDecoder.isExpired(_token!);

  AuthProvider() {
    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('jwt_token');
    if (_token != null && !JwtDecoder.isExpired(_token!)) {
      _userRole = JwtDecoder.decode(_token!)['role'];
    } else {
      _token = null;
      _userRole = null;
    }
    notifyListeners();
  }

  Future<void> saveToken(String newToken) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token', newToken);
    _token = newToken;
    if (!JwtDecoder.isExpired(_token!)) {
      _userRole = JwtDecoder.decode(_token!)['role'];
    }
    notifyListeners();
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token');
    _token = null;
    _userRole = null;
    notifyListeners();
  }
}
