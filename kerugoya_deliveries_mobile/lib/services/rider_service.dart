import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';

class Rider {
  final String id;
  final String name;
  final String phone;
  final String motorcyclePlateNumber;

  Rider({
    required this.id,
    required this.name,
    required this.phone,
    required this.motorcyclePlateNumber,
  });

  factory Rider.fromJson(Map<String, dynamic> json) {
    return Rider(
      id: json['id'],
      name: json['name'],
      phone: json['phone'],
      motorcyclePlateNumber: json['motorcyclePlateNumber'] ?? 'N/A',
    );
  }
}

class RiderService {
  final AuthProvider _authProvider;

  RiderService(this._authProvider);

  Future<List<Rider>> getAvailableRiders() async {
    // Note: In the web app, fetching riders might not require authentication 
    // depending on the API design. Let's assume it doesn't to allow browsing.
    try {
      final response = await ApiService.get(
        'riders',
        token: _authProvider.token,
      );

      if (response is List) {
        return (response as List)
            .map((item) => Rider.fromJson(item))
            .toList();
      } else {
        throw HttpException(message: 'Invalid rider data format', statusCode: 500);
      }
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to fetch riders: ${e.toString()}', statusCode: 500);
    }
  }
}
