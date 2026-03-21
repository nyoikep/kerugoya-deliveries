import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/business.dart';

class BusinessService {
  final AuthProvider _authProvider;

  BusinessService(this._authProvider);

  Future<List<Business>> getBusinesses() async {
    try {
      final response = await ApiService.get(
        'businesses',
        token: _authProvider.token,
      );

      if (response is List) {
        return response
            .map((item) => Business.fromJson(item))
            .toList();
      } else {
        throw HttpException(message: 'Invalid business data format', statusCode: 500);
      }
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to fetch businesses: ${e.toString()}', statusCode: 500);
    }
  }
}
