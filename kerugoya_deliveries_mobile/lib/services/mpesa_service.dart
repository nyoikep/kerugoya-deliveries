import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart'; // To get the token

class MpesaService {
  final AuthProvider _authProvider; // Inject AuthProvider

  MpesaService(this._authProvider); // Constructor to receive AuthProvider

  Future<Map<String, dynamic>> initiateStkPush({
    required double amount,
    required String phoneNumber,
    required String accountReference,
    required String transactionDesc,
  }) async {
    if (!_authProvider.isAuthenticated) {
      throw HttpException(message: 'User not authenticated', statusCode: 401);
    }

    try {
      final response = await ApiService.post(
        'mpesa/stkpush', // Your backend endpoint
        {
          'amount': amount,
          'phoneNumber': phoneNumber,
          'accountReference': accountReference,
          'transactionDesc': transactionDesc,
        },
        token: _authProvider.token, // Pass the JWT token
      );
      return response;
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to initiate STK Push: ${e.toString()}', statusCode: 500);
    }
  }

  // You might add other Mpesa related methods here (e.g., check transaction status)
}
